'use server';

import { z } from 'zod';

const formSchema = z.object({
  topic: z.string(),
  genre: z.string(),
  mood: z.string(),
  description: z.string(),
});

type PoemRequest = z.infer<typeof formSchema>;

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
    // In a real application, you would send this data to a backend,
    // save it to a database, or send an email.
    // For now, we'll just log it to the server console.
    console.log('New poem request received:', validatedValues.data);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
  } catch (error) {
    console.error('Error sending request:', error);
    return { success: false, error: 'Failed to send request. Please try again.' };
  }
}
