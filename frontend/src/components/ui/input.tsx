import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input
 * -----------------------------------------------------------------------------
 * Campo de texto padrão do projeto.
 * - Mantém a identidade visual (bordas, altura, tipografia).
 * - Foco com anel (ring) para acessibilidade.
 *
 * Props extras:
 * - invalid?: boolean  → quando true, destaca o campo como inválido (borda/anel vermelhos).
 *
 * Observações:
 * - Não introduz wrappers (divs) para não alterar a estrutura do DOM nem refs existentes.
 * - Se precisar de ícones embutidos no futuro, podemos criar um <InputField> decorado,
 *   mantendo este <Input> minimalista como base.
 */
export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Define estado visual de erro (não afeta validação do browser). */
    invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type = "text", invalid, ...props }, ref) => {
        return (
            <input
                ref={ref}
                type={type}
                // Acessibilidade: marca semanticamente quando inválido
                aria-invalid={invalid || undefined}
                data-invalid={invalid ? "" : undefined}
                className={cn(
                    // Base visual
                    "flex h-10 w-full rounded-md bg-white px-3 py-2 text-sm placeholder:text-gray-500",
                    "focus:outline-none focus:ring-2 focus:border-transparent",
                    "disabled:cursor-not-allowed disabled:opacity-50",

                    // Bordas e anel de foco (azul por padrão, vermelho quando invalid)
                    invalid
                        ? "border border-red-500 focus:ring-red-500"
                        : "border border-gray-300 focus:ring-blue-500",

                    className
                )}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
