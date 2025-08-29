'use server';

import {
  analyzePhotoForIngredients,
  type AnalyzePhotoForIngredientsInput,
} from '@/ai/flows/analyze-photo-for-ingredients';
import {
  suggestRecipesFromIngredients,
  type SuggestRecipesFromIngredientsInput,
  type SuggestRecipesFromIngredientsOutput
} from '@/ai/flows/suggest-recipes-from-ingredients';

export async function invokeAnalyzePhotoForIngredients(
  input: AnalyzePhotoForIngredientsInput
): Promise<{ ingredients?: string[]; error?: string }> {
  try {
    const output = await analyzePhotoForIngredients(input);
    return { ingredients: output.ingredients };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Ocorreu um erro inesperado ao analisar a imagem.' };
  }
}

export async function invokeSuggestRecipesFromIngredients(
  input: SuggestRecipesFromIngredientsInput
): Promise<{ recipes?: SuggestRecipesFromIngredientsOutput['recipes']; error?: string }> {
  try {
    const output = await suggestRecipesFromIngredients(input);
    const sortedRecipes = output.recipes.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return { recipes: sortedRecipes };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Ocorreu um erro inesperado ao sugerir receitas.' };
  }
}
