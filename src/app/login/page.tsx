
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrome, AlertCircle, RefreshCw } from 'lucide-react';
import { Logo } from '@/components/icons/logo';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    
    try {
      // Try signInWithPopup first as it's more reliable for most cases
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      // Provide more specific error messages
      if (error.code === 'auth/configuration-not-found') {
        setError('Firebase configuration error. Please check your Firebase project setup.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for authentication. Please go to your Firebase Console -> Authentication -> Settings -> Authorized domains and add the domain you are using.');
      } else if (error.code === 'auth/popup-blocked') {
        // If popup is blocked, fall back to redirect
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectError: any) {
          setError(`Login failed: ${redirectError.message}`);
        }
      } else {
        setError(`Login failed: ${error.message}`);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-8 w-8 animate-spin mb-4" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-grow flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>
      
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Bem-vindo de volta!</CardTitle>
          <CardDescription>
            Faça login para começar a cozinhar.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <Button 
            onClick={handleGoogleSignIn} 
            className="w-full" 
            size="lg"
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-5 w-5" />
            )}
            {isSigningIn ? 'Processando...' : 'Entrar com o Google'}
          </Button>
          
          <div className="text-xs text-muted-foreground text-center">
            <p>Ao continuar, você concorda com nossos Termos de Serviço.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
