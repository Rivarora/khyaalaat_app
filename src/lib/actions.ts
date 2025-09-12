'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { addPoetry, deletePoetryById, updatePoetryLikes, addCommentToPoetry, deleteCommentFromPoetry } from './data';
import type { Poetry } from './definitions';

const uploadSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  caption: z.string().optional(),
  genre: z.enum(['Love', 'Sad', 'Motivational', 'Nature', 'Other']),
  mood: z.string().optional(),
  tags: z.string().optional(),
});

export async function uploadPoetry(prevState: any, formData: FormData) {
  const validatedFields = uploadSchema.safeParse({
    title: formData.get('title'),
    caption: formData.get('caption'),
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
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  const imagePath = `/uploads/${filename}`;
  const fullPath = join(uploadDir, filename);

  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(fullPath, buffer);
  } catch (error) {
    console.error('Failed to write file:', error);
    return { message: 'Error: Could not save image.' };
  }

  const newPoetry: Poetry = {
    id: Date.now().toString(),
    title,
    genre,
    image: {
      id: Date.now().toString(),
      imageUrl: imagePath,
      imageHint: 'poetry image',
      description: title,
    },
    likes: 0,
    comments: [],
  };

  await addPoetry(newPoetry);

  revalidatePath('/');

  return { message: `Poetry "${title}" uploaded successfully!` };
}

export async function deletePoetry(poetryId: string) {
  const deletedPoetry = await deletePoetryById(poetryId);

  if (deletedPoetry) {
    // Delete the image file from the server
    try {
      const imagePath = join(process.cwd(), 'public', deletedPoetry.image.imageUrl);
      await unlink(imagePath);
    } catch (error) {
      // Log the error but don't block the response.
      // The image might not exist, or there could be a permissions issue.
      console.error(`Failed to delete image file: ${deletedPoetry.image.imageUrl}`, error);
    }
  }

  revalidatePath('/');
}

export async function likePoetry(poetryId: string, isLiked: boolean) {
  await updatePoetryLikes(poetryId, isLiked);
  revalidatePath('/');
}

export async function addComment(poetryId: string, comment: string) {
  await addCommentToPoetry(poetryId, comment);
  revalidatePath('/');
}

export async function deleteComment(poetryId: string, commentId: string) {
  await deleteCommentFromPoetry(poetryId, commentId);
  revalidatePath('/');
}
