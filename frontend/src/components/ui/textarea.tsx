import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Textarea
 * -----------------------------------------------------------------------------
 * Campo de texto multilinha, acessível e consistente com o tema do projeto.
 *
 * Props extras:
 * - invalid?: boolean → quando true, aplica estilo de erro (borda/anel vermelhos)
 *
 * Observações:
 * - Mantém DOM “limpo” (sem wrappers) para não afetar refs/estilos existentes.
 * - Use com <Label htmlFor="..."> para acessibilidade.
 */
export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Define estado visual de erro (não altera a validação nativa do browser). */
    invalid?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, invalid, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                // Acessibilidade: expõe estado inválido para leitores de tela
                aria-invalid={invalid || undefined}
                data-invalid={invalid ? "" : undefined}
                className={cn(
                    // Base visual
                    "flex min-h-[80px] w-full rounded-md bg-background px-3 py-2 text-sm placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:border-transparent",
                    "disabled:cursor-not-allowed disabled:opacity-50",

                    // Borda padrão vs. estado inválido (segue padrão do Input)
                    invalid
                        ? "border border-red-500 focus:ring-red-500"
                        : "border border-input focus:ring-ring",

                    // Ring offset para acessibilidade (consistente com demais campos)
                    "ring-offset-background",

                    className
                )}
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";

export { Textarea };
