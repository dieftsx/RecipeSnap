
"use client";

import { useState, useRef, type ChangeEvent, useEffect, useCallback } from 'react';
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
  Heart,
  Star,
  Trash2,
  HeartCrack,
  Upload,
  Video,
  FlipHorizontal,
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
import { 
  invokeAnalyzePhotoForIngredients, 
  invokeSuggestRecipesFromIngredients,
  addRecipeToFavorites,
  getFavoriteRecipes,
  removeRecipeFromFavorites, 
} from '@/lib/actions';
import type { Recipe } from '@/lib/types';
import { Logo } from '@/components/icons/logo';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


// Main Page Component
export default function DashboardPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState<string>('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [inputMode, setInputMode] = useState<'upload' | 'camera'>('upload');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const router = useRouter();

  // Load state from sessionStorage on initial render
  useEffect(() => {
    try {
      const persistedState = sessionStorage.getItem('recipeSnapState');
      if (persistedState) {
        const state = JSON.parse(persistedState);
        setImagePreview(state.imagePreview);
        setImageDataUri(state.imageDataUri);
        setIngredients(state.ingredients || []);
        setRecipes(state.recipes);
        setDietaryRestrictions(state.dietaryRestrictions || []);
      }
    } catch (error) {
      console.error("Failed to parse state from sessionStorage", error);
      sessionStorage.removeItem('recipeSnapState');
    }
  }, []);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    try {
      const stateToPersist = {
        imagePreview,
        imageDataUri,
        ingredients,
        recipes,
        dietaryRestrictions,
      };
      sessionStorage.setItem('recipeSnapState', JSON.stringify(stateToPersist));
    } catch (error) {
      console.error("Failed to save state to sessionStorage", error);
    }
  }, [imagePreview, imageDataUri, ingredients, recipes, dietaryRestrictions]);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setIsLoadingFavorites(true);
    const { recipes, error } = await getFavoriteRecipes(user.uid);
    if (error) {
      toast({ title: 'Erro ao buscar favoritos', description: error, variant: 'destructive' });
    } else {
      setFavoriteRecipes(recipes || []);
    }
    setIsLoadingFavorites(false);
  }, [user, toast]);
  
  const resetState = () => {
      setImagePreview(null);
      setImageDataUri(null);
      setIngredients([]);
      setRecipes(null);
  }

  useEffect(() => {
    if (inputMode === 'camera') {
      const getCameraPermission = async () => {
        try {
          // Stop any existing stream before getting a new one
          if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
          }
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Acesso à câmera negado',
            description: 'Por favor, habilite a permissão da câmera nas configurações do seu navegador.',
          });
        }
      };
      getCameraPermission();
    } else {
      // Cleanup camera stream when switching away
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    }
  }, [inputMode, toast]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      fetchFavorites();
    }
  }, [user, loading, router, fetchFavorites]);

  if (loading || !user) {
    return <div className="flex h-screen w-full items-center justify-center">Carregando...</div>;
  }
  
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      resetState();

      const reader = new FileReader();
      reader.onload = (e) => {
        setImageDataUri(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        resetState();
        setImageDataUri(dataUri);
        setImagePreview(dataUri);
      }
    }
  };

  const handleAnalyzeClick = async () => {
    if (!imageDataUri) {
      toast({ title: 'Nenhuma imagem selecionada', description: 'Por favor, envie ou capture uma imagem primeiro.', variant: 'destructive' });
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

  const handleToggleFavorite = async (recipe: Recipe) => {
    if (!user) return;
    
    const isFavorite = favoriteRecipes.some(fav => fav.name === recipe.name);

    if (isFavorite) {
      const { success, error } = await removeRecipeFromFavorites(user.uid, recipe.name);
      if (success) {
        toast({ title: 'Receita removida dos favoritos!' });
        setFavoriteRecipes(prev => prev.filter(fav => fav.name !== recipe.name));
      } else {
        toast({ title: 'Erro ao remover favorito', description: error, variant: 'destructive' });
      }
    } else {
      const { success, error } = await addRecipeToFavorites(user.uid, recipe);
      if (success) {
        toast({ title: 'Receita adicionada aos favoritos!' });
        setFavoriteRecipes(prev => [...prev, recipe]);
      } else {
        toast({ title: 'Erro ao adicionar favorito', description: error, variant: 'destructive' });
      }
    }
  };

  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetariano', icon: Leaf },
    { id: 'vegan', label: 'Vegano', icon: Vegan },
    { id: 'gluten-free', label: 'Sem Glúten', icon: WheatOff },
    { id: 'dairy-free', label: 'Sem Laticínios', icon: MilkOff },
  ];

  return (
    <div className="flex-grow bg-background text-foreground">
      <header className="py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Logo />
        </div>
      </header>
      <main className="px-4 md:px-8 pb-16">
        <Tabs defaultValue="generator" className="max-w-4xl mx-auto">
          <TabsList className="mb-4">
            <TabsTrigger value="generator">Gerador de Receitas</TabsTrigger>
            <TabsTrigger value="favorites">Receitas Favoritas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator" className="flex flex-col gap-8">
            <Card className="overflow-hidden shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-3">
                  <div className="bg-accent text-accent-foreground rounded-full h-8 w-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                  Envie ou fotografe seus ingredientes
                </CardTitle>
                 <CardDescription>Deixe nosso chef de IA ver o que você tem em mãos. Use uma foto existente ou a câmera do seu dispositivo.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6 items-center">
                <div className="flex flex-col gap-4">
                    <ToggleGroup 
                      type="single" 
                      defaultValue="upload" 
                      value={inputMode}
                      onValueChange={(value: 'upload' | 'camera') => value && setInputMode(value)}
                      className="w-full"
                    >
                      <ToggleGroupItem value="upload" className="w-1/2" aria-label="Upload a photo">
                        <Upload className="h-4 w-4 mr-2" /> Upload
                      </ToggleGroupItem>
                      <ToggleGroupItem value="camera" className="w-1/2" aria-label="Use camera">
                        <Video className="h-4 w-4 mr-2" /> Câmera
                      </ToggleGroupItem>
                    </ToggleGroup>
                    
                    {inputMode === 'upload' && (
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
                    )}
                    
                    {inputMode === 'camera' && (
                      <div className="relative aspect-video w-full bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {hasCameraPermission === false ? (
                           <Alert variant="destructive" className='w-full mx-4'>
                            <AlertTitle>Acesso à Câmera Necessário</AlertTitle>
                            <AlertDescription>
                              Por favor, permita o acesso à câmera para usar esta função.
                            </AlertDescription>
                          </Alert>
                        ) : imagePreview ? (
                           <Image src={imagePreview} alt="Captura dos ingredientes" fill className="object-cover rounded-lg" />
                        ) : (
                          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                        )}
                         <canvas ref={canvasRef} className="hidden" />
                      </div>
                    )}
                </div>

                <div className="flex flex-col gap-4 items-start">
                  {inputMode === 'camera' && !imagePreview && (
                    <>
                      <p className="text-muted-foreground">Posicione os ingredientes na frente da câmera e clique em capturar.</p>
                       <Button onClick={handleCapturePhoto} size="lg" disabled={hasCameraPermission === false}>
                        <Camera className="mr-2 h-4 w-4" />
                        Capturar Foto
                      </Button>
                    </>
                  )}
                   {inputMode === 'camera' && imagePreview && (
                     <>
                      <p className="text-muted-foreground">Foto capturada! Agora você pode analisar os ingredientes.</p>
                       <Button onClick={() => setImagePreview(null)} size="lg" variant="outline">
                        <FlipHorizontal className="mr-2 h-4 w-4" />
                        Tirar outra foto
                      </Button>
                    </>
                  )}
                  {inputMode === 'upload' && (
                     <p className="text-muted-foreground">Depois de enviar uma imagem, vamos analisá-la para identificar seus ingredientes.</p>
                  )}
                  
                  <Button onClick={handleAnalyzeClick} disabled={!imagePreview || isLoadingIngredients} size="lg">
                    {isLoadingIngredients ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Analisar Ingredientes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {(ingredients.length > 0 || isLoadingIngredients || recipes) && (
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
                          <Checkbox 
                            id={opt.id}
                            checked={dietaryRestrictions.includes(opt.label)} 
                            onCheckedChange={(checked) => handleDietaryChange(opt.label, !!checked)} 
                          />
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
          </TabsContent>

          <TabsContent value="favorites">
             <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-3">
                  <Heart className="h-6 w-6 text-primary" />
                  Suas Receitas Favoritas
                </CardTitle>
                <CardDescription>Aqui estão as receitas que você salvou para mais tarde.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingFavorites ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="aspect-video bg-muted rounded-t-lg"></div>
                        <CardHeader><div className="h-6 w-3/4 bg-muted rounded"></div></CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : favoriteRecipes && favoriteRecipes.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteRecipes.map((recipe) => (
                      <RecipeCard 
                        key={recipe.name} 
                        recipe={recipe} 
                        onSelect={() => setSelectedRecipe(recipe)}
                        isFavorite={true}
                        onToggleFavorite={() => handleToggleFavorite(recipe)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <HeartCrack className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg">Você ainda não tem receitas favoritas.</p>
                    <p>Use o gerador e clique no coração para salvar uma receita.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <RecipeDetailsDialog 
          recipe={selectedRecipe} 
          onOpenChange={() => setSelectedRecipe(null)} 
          isFavorite={selectedRecipe ? favoriteRecipes.some(fav => fav.name === selectedRecipe.name) : false}
          onToggleFavorite={handleToggleFavorite}
          user={user}
        />
      </main>
    </div>
  );
}

function RecipeCard({ recipe, onSelect, isFavorite, onToggleFavorite }: { recipe: Recipe; onSelect: () => void; isFavorite?: boolean; onToggleFavorite?: () => void }) {
  return (
    <Card className="cursor-pointer flex flex-col group overflow-hidden relative">
      {onToggleFavorite && isFavorite !== undefined && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 z-10 bg-background/70 hover:bg-background rounded-full h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
      )}
      <div onClick={onSelect}>
        <div className="relative aspect-video">
          <Image src={`https://picsum.photos/seed/${encodeURIComponent(recipe.name)}/400/300`} alt={recipe.name} fill className="object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105" data-ai-hint="receita comida"/>
        </div>
        <CardHeader>
          <CardTitle className="font-headline text-lg">{recipe.name}</CardTitle>
        </CardHeader>
      </div>
    </Card>
  );
}


function RecipeDetailsDialog({ recipe, onOpenChange, isFavorite, onToggleFavorite, user }: { recipe: Recipe | null; onOpenChange: () => void; isFavorite: boolean; onToggleFavorite: (recipe: Recipe) => void; user: any }) {
  if (!recipe) return null;

  return (
    <Dialog open={!!recipe} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className='flex items-start justify-between'>
            <DialogTitle className="font-headline text-3xl">{recipe.name}</DialogTitle>
            {user && (
              <Button
                size="icon"
                variant={isFavorite ? "destructive" : "outline"}
                onClick={() => onToggleFavorite(recipe)}
                className="ml-4 flex-shrink-0"
              >
                {isFavorite ? <HeartCrack className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
                <span className="sr-only">{isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}</span>
              </Button>
            )}
          </div>
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

    