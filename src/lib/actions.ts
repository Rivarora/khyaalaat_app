
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { addPoetry, deletePoetryById, updatePoetryLikes } from './data';
import { addCommentSupabase, deleteCommentSupabase, insertPoemSupabase, deletePoemSupabase } from './supabasePoems';
import { supabase } from './supabaseClient';
import type { Poetry, UserInfo } from './definitions';

const uploadSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  genre: z.enum(['Love', 'Sad', 'Motivational', 'Nature', 'Friendship', 'Parents', 'Other']),
  mood: z.string().optional(),
  tags: z.string().optional(),
});

export async function uploadPoetry(prevState: any, formData: FormData) {
  const validatedFields = uploadSchema.safeParse({
    title: formData.get('title'),
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

  const { title, genre } = validatedFields.data;

  const image = formData.get('image') as File;
  if (!image || image.size === 0) {
    return { message: 'Error: Image is required.' };
  }

  const buffer = Buffer.from(await image.arrayBuffer());
  const filename = `${Date.now()}-${image.name}`;
  
  // Upload to Supabase Storage (persists across deployments)
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('poems')
    .upload(filename, buffer, {
      contentType: image.type,
      cacheControl: '3600',
    });

  if (uploadError) {
    console.error('Supabase upload error:', uploadError);
    return { message: 'Error: Could not save image to storage.' };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('poems')
    .getPublicUrl(filename);

  const imagePath = publicUrl;

  const newPoetry: Poetry = {
    id: Date.now().toString(),
    title,
    genre,
    caption: undefined,
    poem: '',
    image: {
      id: Date.now().toString(),
      imageUrl: imagePath,
      imageHint: 'poetry image',
      description: title,
    },
    likes: [],
    comments: [],
  };

  // Write to local JSON for compatibility and to Supabase for dashboard listing
  await addPoetry(newPoetry);
  try {
    await insertPoemSupabase(newPoetry);
  } catch (e) {
    // swallow if Supabase table not present
  }

  revalidatePath('/');

  return { message: `Poetry "${title}" uploaded successfully!` };
}

export async function deletePoetry(poetryId: string) {
  const deletedPoetry = await deletePoetryById(poetryId);

  if (deletedPoetry) {
    // Delete the image file from the server
    try {
      if (deletedPoetry.image.imageUrl.startsWith('/uploads/')) {
        const imagePath = join(process.cwd(), 'public', deletedPoetry.image.imageUrl);
        await unlink(imagePath);
      }
    } catch (error) {
      // Log the error but don't block the response.
      // The image might not exist, or there could be a permissions issue.
      console.error(`Failed to delete image file: ${deletedPoetry.image.imageUrl}`, error);
    }
  }

  try {
    await deletePoemSupabase(poetryId);
  } catch (e) {
    // swallow
  }

  revalidatePath('/');
}

export async function likePoetry(poetryId: string, user: UserInfo, isLiked: boolean) {
  await updatePoetryLikes(poetryId, user, isLiked);
  revalidatePath('/');
}

export async function addComment(poetryId: string, comment: string, user: UserInfo) {
  await addCommentSupabase(poetryId, comment, user);
  revalidatePath('/');
}

export async function deleteComment(poetryId: string, commentId: string) {
  await deleteCommentSupabase(poetryId, commentId);
  revalidatePath('/');
}
