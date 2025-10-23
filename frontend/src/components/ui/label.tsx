"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Label (Radix + shadcn)
 * -----------------------------------------------------------------------------
 * Mantém a identidade visual do projeto e adiciona:
 * - required?: boolean  → exibe asterisco visual sem afetar leitores de tela;
 * - srOnly?: boolean    → variante para esconder visualmente, mantendo acessível.
 *
 * Uso comum:
 *   <Label htmlFor="nome">Nome</Label>
 *   <Input id="nome" />
 *
 * Uso com obrigatório visual:
 *   <Label htmlFor="cpf" required>CPF</Label>
 *
 * Uso "apenas para leitores de tela":
 *   <Label htmlFor="busca" srOnly>Buscar</Label>
 */
const labelVariants = cva(
    // Base visual do label
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    {
        variants: {
            /** Quando true, o label fica somente para leitores de tela (sr-only). */
            srOnly: {
                true: "sr-only",
                false: "",
            },
        },
        defaultVariants: {
            srOnly: false,
        },
    }
);

export interface LabelProps
    extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
        VariantProps<typeof labelVariants> {
    /**
     * Exibe um asterisco visual para indicar campo obrigatório.
     * Não altera validação do browser; é apenas indicativo visual.
     */
    required?: boolean;
}

const Label = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    LabelProps
>(({ className, children, required, srOnly, ...props }, ref) => {
    return (
        <LabelPrimitive.Root
            ref={ref}
            className={cn(labelVariants({ srOnly }), className)}
            {...props}
        >
            {/* Conteúdo principal do label */}
            {children}
            {/* Asterisco visual para campos obrigatórios (não lido por screen readers) */}
            {required ? (
                <span aria-hidden="true" className="ml-0.5 text-red-600">
          *
        </span>
            ) : null}
        </LabelPrimitive.Root>
    );
});
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
