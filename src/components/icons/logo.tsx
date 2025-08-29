import { ChefHat } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-primary rounded-full p-2 flex-shrink-0">
        <ChefHat className="h-6 w-6 text-primary-foreground" />
      </div>
      <h1 className="text-2xl font-headline font-bold text-foreground">Receita Inteligente</h1>
    </div>
  );
}
