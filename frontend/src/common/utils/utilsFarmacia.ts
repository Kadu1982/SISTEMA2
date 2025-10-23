import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * AULA: Esta é uma função auxiliar (helper) crucial para trabalhar com Tailwind CSS em componentes React.
 * `clsx` permite que você passe classes condicionalmente (ex: `clsx('p-4', { 'bg-red-500': hasError })`).
 * `twMerge` resolve conflitos de classes do Tailwind (ex: se você tiver 'p-2' e 'p-4' na mesma lista, ele garante que apenas 'p-4' seja aplicado).
 * Juntos, eles nos dão o poder de construir componentes de UI flexíveis e estilizados dinamicamente.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}