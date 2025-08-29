'use server';

import {
  analyzePhotoForIngredients,
  type AnalyzePhotoForIngredientsInput,
} from '@/ai/flows/analyze-photo-for-ingredients';
import {
  suggestRecipesFromIngredients,
  type SuggestRecipesFromIngredientsInput,
  type SuggestRecipesFromIngredientsOutput,
} from '@/ai/flows/suggest-recipes-from-ingredients';
import { db } from '@/lib/firebase';
import type { Recipe } from '@/lib/types';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';

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

export async function addRecipeToFavorites(
  userId: string,
  recipe: Recipe
): Promise<{ success: boolean; error?: string }> {
  try {
    const recipeRef = doc(db, 'users', userId, 'favorites', recipe.name);
    await setDoc(recipeRef, recipe);
    return { success: true };
  } catch (e: any) {
    console.error('Error adding recipe to favorites:', e);
    return { success: false, error: e.message };
  }
}

export async function getFavoriteRecipes(
  userId: string
): Promise<{ recipes?: Recipe[]; error?: string }> {
  try {
    const favoritesCol = collection(db, 'users', userId, 'favorites');
    const snapshot = await getDocs(favoritesCol);
    const recipes = snapshot.docs.map(doc => doc.data() as Recipe);
    return { recipes };
  } catch (e: any) {
    console.error('Error getting favorite recipes:', e);
    return { error: e.message };
  }
}

export async function removeRecipeFromFavorites(
  userId: string,
  recipeName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const recipeRef = doc(db, 'users', userId, 'favorites', recipeName);
    await deleteDoc(recipeRef);
    return { success: true };
  } catch (e: any) {
    console.error('Error removing recipe from favorites:', e);
    return { success: false, error: e.message };
  }
}
