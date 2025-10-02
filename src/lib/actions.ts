
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addPoetry, deletePoetryById, updatePoetryLikes, addCommentToPoetry, deleteCommentFromPoetry } from './data';
import { uploadImage, deleteImage } from './supabase/storage';
import { createClient } from './supabase/server';
import type { Poetry, UserInfo } from './definitions';

const uploadSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  caption: z.string().optional(),
  poem: z.string().min(10, 'Full poem must be at least 10 characters.'),
  genre: z.enum(['Love', 'Sad', 'Motivational', 'Nature', 'Other']),
  mood: z.string().optional(),
  tags: z.string().optional(),
});

export async function uploadPoetry(prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { message: 'Error: You must be logged in to upload poetry.' };
  }

  const validatedFields = uploadSchema.safeParse({
    title: formData.get('title'),
    caption: formData.get('caption'),
    poem: formData.get('poem'),
    genre: formData.get('genre'),
    mood: formData.get('mood'),
    tags: formData.get('tags'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error: Please check the form fields.',
    };
  }

  const { title, genre, caption, poem } = validatedFields.data;

  const image = formData.get('image') as File;
  if (!image || image.size === 0) {
    return { message: 'Error: Image is required.' };
  }

  // Upload image to Supabase Storage
  const { url: imageUrl, error: uploadError } = await uploadImage(image, user.id);
  if (uploadError) {
    return { message: `Error: Could not save image. ${uploadError}` };
  }

  const newPoetry: Omit<Poetry, 'likes' | 'comments'> = {
    id: crypto.randomUUID(),
    title,
    genre,
    caption,
    poem,
    image: {
      id: crypto.randomUUID(),
      imageUrl,
      imageHint: 'poetry image',
      description: title,
    },
  };

  try {
    await addPoetry(newPoetry);
    revalidatePath('/');
    return { message: `Poetry "${title}" uploaded successfully!` };
  } catch (error) {
    // If poetry creation fails, clean up the uploaded image
    await deleteImage(imageUrl);
    return { message: 'Error: Could not save poetry. Please try again.' };
  }
}

export async function deletePoetry(poetryId: string) {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  const deletedPoetry = await deletePoetryById(poetryId);

  if (deletedPoetry) {
    // Delete the image from Supabase Storage
    if (deletedPoetry.image.imageUrl) {
      const { error } = await deleteImage(deletedPoetry.image.imageUrl);
      if (error) {
        console.error(`Failed to delete image file: ${deletedPoetry.image.imageUrl}`, error);
      }
    }
  }

  revalidatePath('/');
}

export async function likePoetry(poetryId: string, user: UserInfo, isLiked: boolean) {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return;
  }

  await updatePoetryLikes(poetryId, user, isLiked);
  revalidatePath('/');
}

export async function addComment(poetryId: string, comment: string, user: UserInfo) {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return;
  }

  await addCommentToPoetry(poetryId, comment, user);
  revalidatePath('/');
}

export async function deleteComment(poetryId: string, commentId: string) {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  await deleteCommentFromPoetry(poetryId, commentId);
  revalidatePath('/');
}
