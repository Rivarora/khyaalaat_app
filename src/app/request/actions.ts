'use server';

import { z } from 'zod';
import { addRequest } from '@/lib/requests';

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

export type PoemRequest = z.infer<typeof formSchema>;

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function sendRequest(
  values: PoemRequest
): Promise<ActionResult> {
  const validatedValues = formSchema.safeParse(values);

  if (!validatedValues.success) {
    return { success: false, error: 'Invalid input.' };
  }

  try {
    const newRequest = {
      id: Date.now().toString(),
      ...validatedValues.data,
      createdAt: new Date().toISOString(),
    };
    
    await addRequest(newRequest);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending request:', error);
    return { success: false, error: 'Failed to save request. Please try again.' };
  }
}
