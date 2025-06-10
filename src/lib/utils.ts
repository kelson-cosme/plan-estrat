// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Refinada para garantir que a data seja tratada como local para exibição.
export function formatDateForDisplay(dateString: string | null | undefined): string {
  if (!dateString) return '';
  // Separar ano, mês e dia
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Cria o objeto Date usando os componentes ano, mês e dia no fuso horário local
  // Isso evita que o new Date('YYYY-MM-DD') seja interpretado como UTC
  const dateObject = new Date(year, month - 1, day); 

  // Formata para a localidade brasileira
  return dateObject.toLocaleDateString('pt-BR');
}