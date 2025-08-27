'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting recipes based on a list of ingredients.
 *
 * - suggestRecipesFromIngredients - A function that takes a list of ingredients and returns a list of recipe suggestions.
 * - SuggestRecipesFromIngredientsInput - The input type for the suggestRecipesFromIngredients function.
 * - SuggestRecipesFromIngredientsOutput - The return type for the suggestRecipesFromIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipesFromIngredientsInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients identified from the image.'),
  dietaryRestrictions: z
    .array(z.string())
    .optional()
    .describe('A list of dietary restrictions to consider when suggesting recipes.'),
});

export type SuggestRecipesFromIngredientsInput = z.infer<
  typeof SuggestRecipesFromIngredientsInputSchema
>;

const RecipeSuggestionSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  ingredients: z.array(z.string()).describe('The list of ingredients needed for the recipe.'),
  instructions: z.string().describe('The cooking instructions for the recipe.'),
  relevanceScore: z.number().describe('A score indicating the relevance of the recipe to the ingredients.'),
  source: z.string().optional().describe('The source of the recipe, e.g., a website or cookbook.'),
});

const SuggestRecipesFromIngredientsOutputSchema = z.object({
  recipes: z.array(RecipeSuggestionSchema).describe('A list of recipe suggestions.'),
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
  prompt: `You are a recipe suggestion expert. Given a list of ingredients, you will suggest a list of recipes that can be made with those ingredients.

Ingredients: {{{ingredients}}}

{{#if dietaryRestrictions}}
Dietary Restrictions: {{{dietaryRestrictions}}}
{{/if}}

Suggest recipes that are most relevant to the given ingredients. Return the recipes in the following JSON format:

{{json examples=[{recipes: [{name: 'Recipe Name', ingredients: ['ingredient1', 'ingredient2'], instructions: 'Step-by-step instructions', relevanceScore: 0.9, source: 'Optional source'}]}]}}
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
