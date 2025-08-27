'use server';
/**
 * @fileOverview Analyzes a photo to identify ingredients.
 *
 * - analyzePhotoForIngredients - A function that analyzes a photo and identifies ingredients.
 * - AnalyzePhotoForIngredientsInput - The input type for the analyzePhotoForIngredients function.
 * - AnalyzePhotoForIngredientsOutput - The return type for the analyzePhotoForIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePhotoForIngredientsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePhotoForIngredientsInput = z.infer<typeof AnalyzePhotoForIngredientsInputSchema>;

const AnalyzePhotoForIngredientsOutputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients identified in the photo.'),
});
export type AnalyzePhotoForIngredientsOutput = z.infer<typeof AnalyzePhotoForIngredientsOutputSchema>;

export async function analyzePhotoForIngredients(
  input: AnalyzePhotoForIngredientsInput
): Promise<AnalyzePhotoForIngredientsOutput> {
  return analyzePhotoForIngredientsFlow(input);
}

const analyzePhotoForIngredientsPrompt = ai.definePrompt({
  name: 'analyzePhotoForIngredientsPrompt',
  input: {schema: AnalyzePhotoForIngredientsInputSchema},
  output: {schema: AnalyzePhotoForIngredientsOutputSchema},
  prompt: `You are an expert chef. Analyze the photo and identify the ingredients.

  Photo: {{media url=photoDataUri}}

  List the ingredients you identify.`, // Removed unnecessary stock price instruction.
});

const analyzePhotoForIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzePhotoForIngredientsFlow',
    inputSchema: AnalyzePhotoForIngredientsInputSchema,
    outputSchema: AnalyzePhotoForIngredientsOutputSchema,
  },
  async input => {
    const {output} = await analyzePhotoForIngredientsPrompt(input);
    return output!;
  }
);
