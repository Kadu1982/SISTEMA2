import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * buttonVariants
 * ----------------------------------------------------------------------------
 * - Mantém sua identidade visual (tons de azul e cinza que você já usava).
 * - Controla variantes (visual) e tamanhos via class-variance-authority (cva).
 * - Sinta-se à vontade pra trocar as classes por tokens do seu tema (ex.: bg-primary).
 */
export const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
    {
        variants: {
            variant: {
                default: "bg-blue-600 text-white hover:bg-blue-700",
                destructive: "bg-red-600 text-white hover:bg-red-700",
                outline: "border border-gray-300 hover:bg-gray-50 text-gray-700",
                secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
                ghost: "hover:bg-gray-100 text-gray-700",
                link: "underline-offset-4 hover:underline text-blue-600",
            },
            size: {
                default: "h-10 py-2 px-4",
                sm: "h-9 px-3 rounded-md",
                lg: "h-11 px-8 rounded-md",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

/**
 * Tipagem do Button
 * ----------------------------------------------------------------------------
 * - `asChild`: permite renderizar o conteúdo como outro elemento (ex.: <Link>), mantendo estilos.
 * - `isLoading`: opcional; se true, desabilita o botão e exibe um spinner.
 * - `leadingIcon` / `trailingIcon`: opcionais; para ícones à esquerda/direita do texto.
 *   > São NÃO-QUEBRANTES: se você não passar nada, o comportamento é igual ao seu original.
 */
export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
}

/**
 * Spinner simples (sem depender de libs externas).
 * - É usado somente quando `isLoading` for true.
 * - `aria-hidden` para não poluir leitores de tela; o estado acessível é no botão.
 */
function Spinner() {
    return (
        <span
            aria-hidden="true"
            className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent align-[-0.125em]"
        />
    );
}

/**
 * Button (shadcn + cva)
 * ----------------------------------------------------------------------------
 * Mantive a API original e acrescentei `isLoading`, `leadingIcon`, `trailingIcon`.
 * - Quando `isLoading` estiver true:
 *   - O botão é desabilitado.
 *   - `aria-busy` é setado para acessibilidade.
 *   - Um pequeno spinner é exibido à esquerda do conteúdo.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, isLoading = false, leadingIcon, trailingIcon, children, disabled, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        const computedDisabled = disabled || isLoading;

        return (
            <Comp
                ref={ref}
                className={cn(buttonVariants({ variant, size, className }))}
                disabled={computedDisabled}
                aria-busy={isLoading || undefined}
                {...props}
            >
                {/* Conteúdo do botão: spinner/ícones/children */}
                {isLoading && <Spinner />}

                {!isLoading && leadingIcon ? <span className="mr-2 inline-flex">{leadingIcon}</span> : null}

                <span className="inline-flex">{children}</span>

                {!isLoading && trailingIcon ? <span className="ml-2 inline-flex">{trailingIcon}</span> : null}
            </Comp>
        );
    }
);
Button.displayName = "Button";

export { Button };
