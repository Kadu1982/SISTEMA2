"use client";

/**
 * Dialog (Radix + shadcn)
 * -----------------------------------------------------------------------------
 * Componente de diálogo acessível com animações e portal.
 * Mantém a identidade visual atual (tokens Tailwind do shadcn).
 *
 * Como usar (exemplo):
 *   <Dialog>
 *     <DialogTrigger asChild>
 *       <Button>Abrir</Button>
 *     </DialogTrigger>
 *     <DialogContent>
 *       <DialogHeader>
 *         <DialogTitle>Título</DialogTitle>
 *         <DialogDescription>Descrição opcional</DialogDescription>
 *       </DialogHeader>
 *       ...conteúdo...
 *       <DialogFooter>
 *         <Button variant="secondary">Cancelar</Button>
 *         <Button>Confirmar</Button>
 *       </DialogFooter>
 *     </DialogContent>
 *   </Dialog>
 *
 * Observações:
 * - Sempre que possível, coloque botões de ação dentro de <DialogFooter>.
 * - <DialogClose> fecha o modal e já tem estilos/foco acessíveis.
 * - O overlay bloqueia interação com o fundo e aplica fade.
 */

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

// Root do diálogo (controla open/close). Geralmente usado como wrapper no JSX.
const Dialog = DialogPrimitive.Root;

// Botão/elemento que dispara a abertura do dialog.
const DialogTrigger = DialogPrimitive.Trigger;

// Portal para renderizar overlay+content fora da árvore normal (evita z-index glitches).
const DialogPortal = DialogPrimitive.Portal;

// Botão de fechar (pode ser usado dentro do conteúdo).
const DialogClose = DialogPrimitive.Close;

/**
 * Camada escura por trás do conteúdo do diálogo.
 * - Usa tokens do shadcn (bg-black/80) + animações data-state.
 * - Mantém acessibilidade: Radix já controla aria-hidden e foco.
 */
const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-black/80",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/**
 * Container do conteúdo do diálogo.
 * - Centralizado com translate, animações de entrada/saída e sombra.
 * - Em telas pequenas (sm:), recebe borda arredondada.
 * - Inclui um botão de fechar com ícone (X) posicionado no canto.
 */
const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
                "gap-4 border bg-background p-6 shadow-lg duration-200",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
                "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
                "sm:rounded-lg",
                className
            )}
            {...props}
        >
            {children}

            {/* Botão de fechar acessível (ícone + sr-only) */}
            <DialogPrimitive.Close
                className={cn(
                    "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity",
                    "hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "disabled:pointer-events-none",
                    "data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                )}
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

/**
 * Cabeçalho do diálogo (título + descrição). Use no topo do DialogContent.
 */
const DialogHeader = ({
                          className,
                          ...props
                      }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left",
            className
        )}
        {...props}
    />
);
DialogHeader.displayName = "DialogHeader";

/**
 * Rodapé do diálogo (ações). Em mobile fica empilhado; em desktop, alinhado à direita.
 */
const DialogFooter = ({
                          className,
                          ...props
                      }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
);
DialogFooter.displayName = "DialogFooter";

/**
 * Título do diálogo (h2 estilizado).
 */
const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

/**
 * Descrição do diálogo (texto de suporte).
 */
const DialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogClose,
};
