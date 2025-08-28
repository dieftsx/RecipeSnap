"use client";

import { useState, useRef, type ChangeEvent } from 'react';
import Image from 'next/image';
import {
  Camera,
  ChefHat,
  Loader2,
  Plus,
  Search,
  Sparkles,
  X,
  Leaf,
  Vegan,
  BookCopy,
  WheatOff,
  MilkOff,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { invokeAnalyzePhotoForIngredients, invokeSuggestRecipesFromIngredients } from '@/lib/actions';
import type { Recipe } from '@/lib/types';
import { Logo } from '@/components/icons/logo';

// Main Page Component
export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState<string>('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIngredients([]);
      setRecipes(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImageDataUri(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAnalyzeClick = async () => {
    if (!imageDataUri) {
      toast({ title: 'Nenhuma imagem selecionada', description: 'Por favor, envie uma imagem primeiro.', variant: 'destructive' });
      return;
    }
    setIsLoadingIngredients(true);
    setRecipes(null);
    const result = await invokeAnalyzePhotoForIngredients({ photoDataUri: imageDataUri });
    if (result.error) {
      toast({ title: 'Falha na análise', description: result.error, variant: 'destructive' });
    } else {
      setIngredients(result.ingredients || []);
    }
    setIsLoadingIngredients(false);
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim().toLowerCase())) {
      setIngredients([...ingredients, newIngredient.trim().toLowerCase()]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIngredients(ingredients.filter((ing) => ing !== ingredientToRemove));
  };

  const handleDietaryChange = (restriction: string, checked: boolean) => {
    setDietaryRestrictions((prev) =>
      checked ? [...prev, restriction] : prev.filter((r) => r !== restriction)
    );
  };

  const handleGetRecipesClick = async () => {
    if (ingredients.length === 0) {
      toast({ title: 'Sem ingredientes', description: 'Por favor, adicione alguns ingredientes para encontrar receitas.', variant: 'destructive' });
      return;
    }
    setIsLoadingRecipes(true);
    setRecipes(null);
    const result = await invokeSuggestRecipesFromIngredients({ ingredients, dietaryRestrictions });
    if (result.error) {
      toast({ title: 'Falha na geração de receitas', description: result.error, variant: 'destructive' });
    } else {
      setRecipes(result.recipes || []);
      if (!result.recipes || result.recipes.length === 0) {
        toast({ title: 'Nenhuma receita encontrada', description: 'Tente ajustar seus ingredientes ou filtros.' });
      }
    }
    setIsLoadingRecipes(false);
  };

  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetariano', icon: Leaf },
    { id: 'vegan', label: 'Vegano', icon: Vegan },
    { id: 'gluten-free', label: 'Sem Glúten', icon: WheatOff },
    { id: 'dairy-free', label: 'Sem Laticínios', icon: MilkOff },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Logo />
        </div>
      </header>
      <main className="px-4 md:px-8 pb-16">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <Card className="overflow-hidden shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-3">
                <div className="bg-accent text-accent-foreground rounded-full h-8 w-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                Envie uma foto dos seus ingredientes
              </CardTitle>
              <CardDescription>Deixe nosso chef de IA ver o que você tem em mãos.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6 items-center">
              <div
                className="relative aspect-video w-full bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                {imagePreview ? (
                  <Image src={imagePreview} alt="Pré-visualização dos ingredientes" fill className="object-cover rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Camera className="h-12 w-12" />
                    <span>Clique para enviar uma imagem</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-4 items-start">
                <p className="text-muted-foreground">Depois de enviar uma imagem, vamos analisá-la para identificar seus ingredientes.</p>
                <Button onClick={handleAnalyzeClick} disabled={!imagePreview || isLoadingIngredients} size="lg">
                  {isLoadingIngredients ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Analisar Ingredientes
                </Button>
              </div>
            </CardContent>
          </Card>

          {(ingredients.length > 0 || isLoadingIngredients) && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-3">
                  <div className="bg-accent text-accent-foreground rounded-full h-8 w-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                  Refine os ingredientes e adicione filtros
                </CardTitle>
                <CardDescription>Adicione ou remova itens e especifique quaisquer necessidades alimentares.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div>
                  <h3 className="font-bold mb-2 font-headline">Ingredientes Identificados</h3>
                  {isLoadingIngredients ? (
                    <div className="flex gap-2 flex-wrap">
                      <div className="h-8 w-24 bg-muted animate-pulse rounded-full" />
                      <div className="h-8 w-32 bg-muted animate-pulse rounded-full" />
                      <div className="h-8 w-20 bg-muted animate-pulse rounded-full" />
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {ingredients.map((ing) => (
                        <Badge key={ing} variant="secondary" className="capitalize text-base py-1 px-3">
                          {ing}
                          <button onClick={() => handleRemoveIngredient(ing)} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {ingredients.length === 0 && <p className="text-muted-foreground">Nenhum ingrediente encontrado. Tente outra foto ou adicione manualmente.</p>}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 items-end">
                  <div className="flex-grow">
                    <Label htmlFor="new-ingredient">Adicionar ingrediente manualmente</Label>
                    <Input id="new-ingredient" value={newIngredient} onChange={(e) => setNewIngredient(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()} placeholder="ex: tomates"/>
                  </div>
                  <Button onClick={handleAddIngredient} variant="outline" aria-label="Adicionar ingrediente">
                    <Plus className="h-4 w-4 mr-2" /> Adicionar
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 font-headline">Filtros Alimentares</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {dietaryOptions.map((opt) => (
                      <div key={opt.id} className="flex items-center space-x-2">
                        <Checkbox id={opt.id} onCheckedChange={(checked) => handleDietaryChange(opt.label, !!checked)} />
                        <Label htmlFor={opt.id} className="flex items-center gap-2 cursor-pointer">
                          <opt.icon className="h-5 w-5 text-muted-foreground" />
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />
                
                <Button onClick={handleGetRecipesClick} disabled={isLoadingRecipes || ingredients.length === 0} size="lg" className="self-start">
                  {isLoadingRecipes ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Encontrar Receitas
                </Button>
              </CardContent>
            </Card>
          )}

          {(recipes || isLoadingRecipes) && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-3">
                  <div className="bg-accent text-accent-foreground rounded-full h-8 w-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                  Bom Apetite!
                </CardTitle>
                <CardDescription>Aqui estão algumas ideias de receitas. Clique em qualquer card para ver a receita completa.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRecipes ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="aspect-video bg-muted rounded-t-lg"></div>
                        <CardHeader><div className="h-6 w-3/4 bg-muted rounded"></div></CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : recipes && recipes.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe) => (
                      <RecipeCard key={recipe.name} recipe={recipe} onSelect={() => setSelectedRecipe(recipe)} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <ChefHat className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg">Não foi possível encontrar nenhuma receita.</p>
                    <p>Tente ser menos específico com seus ingredientes ou filtros.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <RecipeDetailsDialog recipe={selectedRecipe} onOpenChange={() => setSelectedRecipe(null)} />
        </div>
      </main>
    </div>
  );
}

function RecipeCard({ recipe, onSelect }: { recipe: Recipe; onSelect: () => void }) {
  return (
    <Card onClick={onSelect} className="cursor-pointer hover:shadow-xl transition-shadow duration-300 flex flex-col group overflow-hidden">
      <div className="relative aspect-video">
        <Image src={`https://picsum.photos/seed/${encodeURIComponent(recipe.name)}/400/300`} alt={recipe.name} fill className="object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105" data-ai-hint="receita comida"/>
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-lg">{recipe.name}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function RecipeDetailsDialog({ recipe, onOpenChange }: { recipe: Recipe | null; onOpenChange: () => void }) {
  if (!recipe) return null;

  return (
    <Dialog open={!!recipe} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl">{recipe.name}</DialogTitle>
          {recipe.source && (
            <DialogDescription className="flex items-center gap-2 pt-2">
              <BookCopy className="h-4 w-4" />
              Fonte: {recipe.source}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="overflow-y-auto pr-6 -mr-6 space-y-6">
            <div>
              <h3 className="font-bold text-xl mb-2 font-headline">Ingredientes</h3>
              <ul className="list-disc list-inside space-y-1">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="capitalize">{ing}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-2 font-headline">Instruções</h3>
              <div className="space-y-4 text-sm text-foreground/90 whitespace-pre-wrap">
                {recipe.instructions}
              </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
