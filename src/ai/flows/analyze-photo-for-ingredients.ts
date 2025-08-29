'use server';
/**
 * @fileOverview Analisa uma foto para identificar ingredientes.
 *
 * - analyzePhotoForIngredients - Uma função que analisa uma foto e identifica ingredientes.
 * - AnalyzePhotoForIngredientsInput - O tipo de entrada para a função analyzePhotoForIngredients.
 * - AnalyzePhotoForIngredientsOutput - O tipo de retorno para a função analyzePhotoForIngredients.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePhotoForIngredientsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "Uma foto de ingredientes, como um data URI que deve incluir um tipo MIME e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePhotoForIngredientsInput = z.infer<typeof AnalyzePhotoForIngredientsInputSchema>;

const AnalyzePhotoForIngredientsOutputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('Uma lista de ingredientes identificados na foto.'),
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
  prompt: `Você é um chef especialista. Analise a foto e identifique os ingredientes.

  Foto: {{media url=photoDataUri}}

  Liste os ingredientes que você identificar.`,
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
