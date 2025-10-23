"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

/**
 * Switch (Radix + shadcn)
 * -----------------------------------------------------------------------------
 * Componente de alternância acessível.
 *
 * Uso:
 *   <Switch id="ativo" checked={value} onCheckedChange={setValue} />
 *   <Label htmlFor="ativo">Ativo</Label>
 *
 * Acessibilidade:
 * - Prefira parear com <Label htmlFor="...">.
 * - Se não houver label visível, forneça aria-label no Switch.
 *
 * Identidade visual:
 * - Mantive as classes originais (h-6 w-11, cores/tokens do tema).
 * - Estados: data-[state=checked] / data-[state=unchecked].
 */

const Switch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
    <SwitchPrimitives.Root
        ref={ref}
        className={cn(
            // Dimensão/base
            "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
            // Acessibilidade de foco
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            // Estado disabled
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Cores por estado
            "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
            className
        )}
        {...props}
    >
        <SwitchPrimitives.Thumb
            className={cn(
                // Botão deslizante
                "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
                // Posições por estado
                "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
            )}
        />
    </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
