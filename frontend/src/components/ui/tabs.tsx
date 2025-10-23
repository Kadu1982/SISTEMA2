"use client";

/**
 * Tabs (Radix + shadcn)
 * -----------------------------------------------------------------------------
 * Abas acessíveis, com animações e tokens do tema (mantendo sua identidade).
 *
 * Uso básico:
 *   <Tabs defaultValue="dados">
 *     <TabsList>
 *       <TabsTrigger value="dados">Dados</TabsTrigger>
 *       <TabsTrigger value="historico">Histórico</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="dados">...</TabsContent>
 *     <TabsContent value="historico">...</TabsContent>
 *   </Tabs>
 *
 * Dicas:
 * - "value" no Trigger/Content deve casar.
 * - Se quiser manter conteúdo montado no DOM (evitar perder estado),
 *   use a prop do Radix: <TabsContent forceMount value="...">...</TabsContent>
 * - Em telas longas, você pode colocar o <TabsList> no topo fixo da página
 *   e manter os conteúdos abaixo, sem mudar este wrapper.
 */

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

// Root controla o estado (value) e orquestra triggers/contents.
const Tabs = TabsPrimitive.Root;

/**
 * Lista de triggers (as "abas" clicáveis).
 * - Mantém o visual que você já usa (bg-muted, tipografia).
 */
const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
            className
        )}
        {...props}
    />
));
TabsList.displayName = TabsPrimitive.List.displayName;

/**
 * Trigger (cada aba clicável).
 * - Data attributes do Radix controlam estilos de "ativo".
 * - Acessível via teclado (Radix cuida).
 */
const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium",
            "ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            className
        )}
        {...props}
    />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

/**
 * Conteúdo de cada aba.
 * - Usa tokens do shadcn para foco/anel.
 * - Se precisar manter o conteúdo montado (evitar perder estado),
 *   use a prop `forceMount` do Radix.
 */
const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
        )}
        {...props}
    />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
