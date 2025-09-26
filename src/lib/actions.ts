
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addPoetry, deletePoetryById, updatePoetryLikes, addCommentToPoetry, deleteCommentFromPoetry } from './data';
import type { Poetry, UserInfo } from './definitions';
import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';


const uploadSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  caption: z.string().optional(),
  poem: z.string().min(10, 'Full poem must be at least 10 characters.'),
  genre: z.enum(['Love', 'Sad', 'Motivational', 'Nature', 'Other']),
  mood: z.string().optional(),
  tags: z.string().optional(),
});

type UploadState = {
  message: string | null;
  errors?: {
    title?: string[];
    caption?: string[];
    poem?: string[];
    genre?: string[];
    mood?: string[];
    tags?: string[];
  };
};

export async function uploadPoetry(prevState: any, formData: FormData): Promise<UploadState> {
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

  let imageUrl = '';
  let imagePath = '';

  try {
    const buffer = Buffer.from(await image.arrayBuffer());
    const filename = `${Date.now()}-${image.name}`;
    imagePath = `poetry-images/${filename}`;
    const storageRef = ref(storage, imagePath);

    await uploadBytesResumable(storageRef, buffer, {
      contentType: image.type,
    });
    
    imageUrl = await getDownloadURL(storageRef);

  } catch (error) {
    console.error('Failed to upload image:', error);
    return { message: 'Error: Could not save image. Check storage rules.' };
  }


  const newPoetry: Omit<Poetry, 'id'> = {
    title,
    genre,
    caption,
    poem,
    image: {
      id: Date.now().toString(),
      imageUrl: imageUrl,
      imagePath: imagePath,
      imageHint: 'poetry image',
      description: title,
    },
    likes: [],
    comments: [],
    createdAt: new Date(),
  };

  try {
    await addPoetry(newPoetry);
  } catch (error) {
     console.error('Failed to add poetry to database:', error);
     return { message: 'Error: Could not save poetry data.' };
  }

  revalidatePath('/');
  revalidatePath('/admin/upload');

  return { message: `Poetry "${title}" uploaded successfully!` };
}

export async function deletePoetry(poetryId: string) {
  const deletedPoetry = await deletePoetryById(poetryId);

  if (deletedPoetry && deletedPoetry.image.imagePath) {
    try {
      const imageRef = ref(storage, deletedPoetry.image.imagePath);
      await deleteObject(imageRef);
    } catch (error) {
      console.error(`Failed to delete image from storage: ${deletedPoetry.image.imagePath}`, error);
    }
  }

  revalidatePath('/');
}

export async function likePoetry(poetryId: string, user: UserInfo, isLiked: boolean) {
  await updatePoetryLikes(poetryId, user, isLiked);
  revalidatePath('/');
}

export async function addComment(poetryId: string, comment: string, user: UserInfo) {
  await addCommentToPoetry(poetryId, comment, user);
  revalidatePath('/');
}

export async function deleteComment(poetryId: string, commentId: string) {
  await deleteCommentFromPoetry(poetryId, commentId);
  revalidatePath('/');
}

