"use client";

/**
 * Accordion (Radix + shadcn)
 * -----------------------------------------------------------------------------
 * Acordeão acessível, com ícone rotacionando quando aberto e animações suaves.
 *
 * Uso básico:
 *  <Accordion type="single" collapsible>
 *    <AccordionItem value="item-1">
 *      <AccordionTrigger>Seção 1</AccordionTrigger>
 *      <AccordionContent>Conteúdo da seção 1</AccordionContent>
 *    </AccordionItem>
 *    ...
 *  </Accordion>
 *
 * Notas:
 * - `type="single"` (abre um por vez) ou `type="multiple"` (vários abertos).
 * - As animações usam classes utilitárias:
 *    data-[state=closed]:animate-accordion-up
 *    data-[state=open]:animate-accordion-down
 *   Certifique-se de ter as keyframes no seu CSS/Tailwind (padrão do shadcn).
 */

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Root do acordeão. Controla o estado de abertura dos itens. */
const Accordion = AccordionPrimitive.Root;

/**
 * Item do acordeão.
 * - Mantém borda inferior para separar visualmente as seções.
 */
const AccordionItem = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
    <AccordionPrimitive.Item
        ref={ref}
        className={cn("border-b", className)}
        {...props}
    />
));
AccordionItem.displayName = "AccordionItem";

/**
 * Trigger (cabeçalho clicável).
 * - Usa flex para alinhar o rótulo e o ícone.
 * - Chevron rotaciona quando o item está aberto via
 *   `[&[data-state=open]>svg]:rotate-180`.
 */
const AccordionTrigger = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
            ref={ref}
            className={cn(
                "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
                "[&[data-state=open]>svg]:rotate-180",
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
        </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

/**
 * Content (corpo do acordeão).
 * - Anima a abertura/fechamento com utilitárias `animate-accordion-down/up`.
 * - Empacota o conteúdo com padding vertical adequado.
 */
const AccordionContent = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content
        ref={ref}
        className={cn(
            "overflow-hidden text-sm transition-all",
            "data-[state=closed]:animate-accordion-up",
            "data-[state=open]:animate-accordion-down"
        )}
        {...props}
    >
        <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };