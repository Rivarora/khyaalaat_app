'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating poetry topic suggestions based on user input.
 *
 * It exports:
 * - `generatePoetryTopicSuggestions`: An async function that takes user input and returns poetry topic suggestions.
 * - `GeneratePoetryTopicSuggestionsInput`: The input type for the `generatePoetryTopicSuggestions` function.
 * - `GeneratePoetryTopicSuggestionsOutput`: The output type for the `generatePoetryTopicSuggestions` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePoetryTopicSuggestionsInputSchema = z.object({
  topic: z.string().describe('The main topic of the poem.'),
  genre: z.string().describe('The genre of the poem (e.g., Love, Sad, Motivational, Nature).'),
  mood: z.string().describe('The desired mood of the poem (e.g., happy, somber, reflective).'),
  description: z
    .string()
    .describe('A detailed description or context for the poem, to guide the AI.'),
});
export type GeneratePoetryTopicSuggestionsInput = z.infer<
  typeof GeneratePoetryTopicSuggestionsInputSchema
>;

const GeneratePoetryTopicSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested poetry topics based on the input.'),
});
export type GeneratePoetryTopicSuggestionsOutput = z.infer<
  typeof GeneratePoetryTopicSuggestionsOutputSchema
>;

export async function generatePoetryTopicSuggestions(
  input: GeneratePoetryTopicSuggestionsInput
): Promise<GeneratePoetryTopicSuggestionsOutput> {
  return generatePoetryTopicSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePoetryTopicSuggestionsPrompt',
  input: {schema: GeneratePoetryTopicSuggestionsInputSchema},
  output: {schema: GeneratePoetryTopicSuggestionsOutputSchema},
  prompt: `You are a creative assistant for poets, skilled at suggesting unique and engaging poetry topics.

  Based on the poet's input, provide 3-5 distinct poetry topic suggestions that align with their specified genre, mood, and description.

  Topic: {{{topic}}}
  Genre: {{{genre}}}
  Mood: {{{mood}}}
  Description: {{{description}}}

  Suggestions:`,
});

const generatePoetryTopicSuggestionsFlow = ai.defineFlow(
  {
    name: 'generatePoetryTopicSuggestionsFlow',
    inputSchema: GeneratePoetryTopicSuggestionsInputSchema,
    outputSchema: GeneratePoetryTopicSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
