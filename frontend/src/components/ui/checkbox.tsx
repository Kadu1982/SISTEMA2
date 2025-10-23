"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Checkbox (Radix + shadcn)
 * -----------------------------------------------------------------------------
 * - Acessível e controlável (checked/unchecked/indeterminate).
 * - Mantém a identidade visual do projeto (tokens Tailwind/shadcn).
 *
 * Dicas de uso:
 *  <Checkbox id="ativo" checked={value} onCheckedChange={setValue} />
 *  <Label htmlFor="ativo">Ativo</Label>
 *
 * Acessibilidade:
 * - Use <Label htmlFor="..."> sempre que possível.
 * - Para validação/erro, combine com aria-invalid no campo de formulário.
 */
const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
            // Tamanho/base
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary",
            // Foco/acessibilidade
            "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            // Estados desabilitado
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Estados visuais (checked/indeterminate usam a mesma cor de fundo/texto)
            "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
            className
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator
            className={cn("flex items-center justify-center text-current")}
        >
            {/* Ícone padrão; para 'indeterminate' o Radix também mostra o Indicator.
         Se quiser um traço em vez do 'check' quando indeterminate,
         troque dinamicamente por outro ícone. Mantivemos seu visual atual. */}
            <Check className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
