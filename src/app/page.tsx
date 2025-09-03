
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, ScanLine, CookingPot } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import Link from 'next/link';
import Image from 'next/image';
import Food from '@/food.jpg'
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return <div className="flex h-screen w-full items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="flex-grow bg-background text-foreground">
      <header className="py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <Logo />
        </div>
      </header>
      <main className="px-4 md:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-headline font-bold">
                Tire uma foto, cozinhe uma obra-prima.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Transforme os ingredientes que você tem em casa em deliciosas receitas com o poder da inteligência artificial. Chega de se perguntar "o que fazer para o jantar?".
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                <Button asChild size="lg">
                  <Link href="/login">Comece Agora</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-square">
               <Image 
                src={Food}
                alt="Prato de comida delicioso" 
                fill 
                className="object-cover rounded-2xl shadow-2xl"
                data-ai-hint="prato receita"
              />
            </div>
          </div>

          <div className="mt-24 md:mt-32">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">Como Funciona</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <Card>
                <CardHeader>
                  <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                    <ScanLine className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline">1. Fotografe</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Envie uma foto dos seus ingredientes. Nossa IA irá identificá-los em segundos.</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                    <ChefHat className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline">2. Descubra</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Receba sugestões de receitas deliciosas com base no que você tem disponível.</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                    <CookingPot className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline">3. Cozinhe</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Siga o passo a passo e aproveite uma refeição incrível sem sair de casa.</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
