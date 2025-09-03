
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Receita Inteligente',
  description: 'Crie receitas a partir de fotos de seus ingredientes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen" suppressHydrationWarning>
        <AuthProvider>
            <main className="flex-grow">{children}</main>
            <Toaster />
            <footer className="w-full bg-background py-4 px-4 md:px-8 border-t">
              <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
                <p>Cosmic Dev &copy; 2025 - todos os direitos reservados</p>
              </div>
            </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
