'use server';

import {
  generatePoetryTopicSuggestions,
  GeneratePoetryTopicSuggestionsInput,
  GeneratePoetryTopicSuggestionsOutput,
} from '@/ai/flows/generate-poetry-topic-suggestions';
import { z } from 'zod';

const formSchema = z.object({
  topic: z.string(),
  genre: z.string(),
  mood: z.string(),
  description: z.string(),
});

type ActionResult = {
  success: boolean;
  data?: GeneratePoetryTopicSuggestionsOutput;
  error?: string;
};

export async function getSuggestions(
  values: GeneratePoetryTopicSuggestionsInput
): Promise<ActionResult> {
  const validatedValues = formSchema.safeParse(values);

  if (!validatedValues.success) {
    return { success: false, error: 'Invalid input.' };
  }

  try {
    const result = await generatePoetryTopicSuggestions(validatedValues.data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return { success: false, error: 'Failed to generate suggestions. Please try again.' };
  }
}
