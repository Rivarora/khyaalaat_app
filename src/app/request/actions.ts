
'use server';

import { z } from 'zod';
import { addRequest, updateRequestStatus, deleteRequestById } from '@/lib/requests';
import { revalidatePath } from 'next/cache';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  topic: z.string().min(2, {
    message: 'Topic must be at least 2 characters.',
  }),
  genre: z.enum(['Love', 'Sad', 'Motivational', 'Nature']),
  mood: z.string().min(2, {
    message: 'Mood must be at least 2 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
});

export type PoemRequestForm = z.infer<typeof formSchema>;

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function sendRequest(
  values: PoemRequestForm
): Promise<ActionResult> {
  const validatedValues = formSchema.safeParse(values);

  if (!validatedValues.success) {
    return { success: false, error: 'Invalid input.' };
  }

  try {
    await addRequest(validatedValues.data);
    revalidatePath('/requests');
    return { success: true };
  } catch (error) {
    console.error('Error sending request:', error);
    return { success: false, error: 'Failed to save request. Please try again.' };
  }
}

export async function toggleRequestCompleted(id: string, completed: boolean) {
  await updateRequestStatus(id, completed);
  revalidatePath('/requests');
}

export async function deleteRequest(id: string) {
  await deleteRequestById(id);
  revalidatePath('/requests');
}
