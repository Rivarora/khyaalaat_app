
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addPoetry, deletePoetryById, updatePoetryLikes, addCommentToPoetry, deleteCommentFromPoetry } from './data';
import type { Poetry, UserInfo } from './definitions';
import { storage } from './firebase';
import { ref, deleteObject } from 'firebase/storage';


const uploadSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  caption: z.string().optional(),
  poem: z.string().min(10, 'Full poem must be at least 10 characters.'),
  genre: z.enum(['Love', 'Sad', 'Motivational', 'Nature', 'Other']),
  mood: z.string().optional(),
  tags: z.string().optional(),
});

type UploadState = {
  success: boolean;
  message: string;
};

export async function uploadPoetry(
  values: z.infer<typeof uploadSchema>,
  imageUrl: string,
  imagePath: string
): Promise<UploadState> {
  const validatedFields = uploadSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Error: Invalid data provided.',
    };
  }

  const { title, genre, caption, poem } = validatedFields.data;

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
     return { success: false, message: 'Error: Could not save poetry data.' };
  }

  revalidatePath('/');
  revalidatePath('/admin/upload');

  return { success: true, message: `Poetry "${title}" uploaded successfully!` };
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
