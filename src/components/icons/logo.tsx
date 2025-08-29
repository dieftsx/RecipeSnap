
'use client';

import { ChefHat, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export function Logo() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className="flex items-center justify-between w-full">
      <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3">
        <div className="bg-primary rounded-full p-2 flex-shrink-0">
          <ChefHat className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-headline font-bold text-foreground">Receita Inteligente</h1>
      </Link>
      
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer h-10 w-10 border-2 border-primary">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Usuário'} />
              <AvatarFallback>
                <UserIcon />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{user.displayName || 'Meu Perfil'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild>
          <Link href="/login">Entrar</Link>
        </Button>
      )}
    </div>
  );
}
