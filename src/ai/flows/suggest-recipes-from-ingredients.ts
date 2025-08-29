'use server';
/**
 * @fileOverview Este arquivo define um fluxo Genkit para sugerir receitas com base em uma lista de ingredientes.
 *
 * - suggestRecipesFromIngredients - Uma função que recebe uma lista de ingredientes e retorna uma lista de sugestões de receitas.
 * - SuggestRecipesFromIngredientsInput - O tipo de entrada para a função suggestRecipesFromIngredients.
 * - SuggestRecipesFromIngredientsOutput - O tipo de retorno para a função suggestRecipesFromIngredients.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipesFromIngredientsInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('Uma lista de ingredientes identificados a partir da imagem.'),
  dietaryRestrictions: z
    .array(z.string())
    .optional()
    .describe('Uma lista de restrições alimentares a serem consideradas ao sugerir receitas.'),
});

export type SuggestRecipesFromIngredientsInput = z.infer<
  typeof SuggestRecipesFromIngredientsInputSchema
>;

const RecipeSuggestionSchema = z.object({
  name: z.string().describe('O nome da receita.'),
  ingredients: z.array(z.string()).describe('A lista de ingredientes necessários para a receita.'),
  instructions: z.string().describe('As instruções de cozimento para a receita.'),
  relevanceScore: z.number().describe('Uma pontuação que indica a relevância da receita para os ingredientes.'),
  source: z.string().optional().describe('A fonte da receita, por exemplo, um site ou livro de receitas.'),
});

const SuggestRecipesFromIngredientsOutputSchema = z.object({
  recipes: z.array(RecipeSuggestionSchema).describe('Uma lista de sugestões de receitas.'),
});

export type SuggestRecipesFromIngredientsOutput = z.infer<
  typeof SuggestRecipesFromIngredientsOutputSchema
>;

export async function suggestRecipesFromIngredients(
  input: SuggestRecipesFromIngredientsInput
): Promise<SuggestRecipesFromIngredientsOutput> {
  return suggestRecipesFromIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipesFromIngredientsPrompt',
  input: {schema: SuggestRecipesFromIngredientsInputSchema},
  output: {schema: SuggestRecipesFromIngredientsOutputSchema},
  prompt: `Você é um especialista em sugestão de receitas. Dada uma lista de ingredientes, você sugerirá uma lista de receitas que podem ser feitas com esses ingredientes.

Ingredientes: {{#each ingredients}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

{{#if dietaryRestrictions}}
Restrições Alimentares: {{#each dietaryRestrictions}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}

Sugira receitas que sejam mais relevantes para os ingredientes fornecidos. Retorne as receitas no seguinte formato JSON:

{{{json examples=[{recipes: [{name: "Nome da Receita", ingredients: ["ingrediente1", "ingrediente2"], instructions: "Instruções passo a passo.", relevanceScore: 0.9, source: "Fonte opcional"}]}]}}}
`,
});

const suggestRecipesFromIngredientsFlow = ai.defineFlow(
  {
    name: 'suggestRecipesFromIngredientsFlow',
    inputSchema: SuggestRecipesFromIngredientsInputSchema,
    outputSchema: SuggestRecipesFromIngredientsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
