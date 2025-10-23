/**
 * Dropdown Menu (Radix + shadcn)
 * -----------------------------------------------------------------------------
 * Este wrapper padroniza o uso do Dropdown no projeto, mantendo a identidade
 * visual e compondo com utilitários (cn, lucide-react).
 *
 * ⚠️ Dica importante de uso (evita bug clássico do Radix):
 * - Sempre renderize os itens DENTRO de <DropdownMenuContent/>.
 * - Estrutura mínima:
 *     <DropdownMenu>
 *       <DropdownMenuTrigger asChild><Button>Opções</Button></DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuItem onSelect={...}>Ação</DropdownMenuItem>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *
 * Extras úteis inclusos:
 * - DropdownMenuTriggerWithIcon: trigger pronto com ícone (Chevron).
 * - DropdownMenuMultiSelect: seletor múltiplo com CheckboxItem (bom para Exames).
 *
 * Identidade visual: preservada (tokens shadcn: bg-popover, accent, etc.).
 */

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

// ✅ COMPONENTE ROOT
const DropdownMenu = DropdownMenuPrimitive.Root;

// ✅ TRIGGER - Botão que abre o menu
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

// ✅ AGRUPADORES
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

// ✅ SUB-TRIGGER - Para menus aninhados
const DropdownMenuSubTrigger = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
}
>(({ className, inset, children, ...props }, ref) => (
    <DropdownMenuPrimitive.SubTrigger
        ref={ref}
        className={cn(
            "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent hover:bg-accent/50 transition-colors",
            inset && "pl-8",
            className
        )}
        {...props}
    >
        {children}
        <ChevronRight className="ml-auto h-4 w-4" />
    </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

// ✅ SUB-CONTENT - Conteúdo de submenus
const DropdownMenuSubContent = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.SubContent
        ref={ref}
        className={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
        )}
        {...props}
    />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

// ✅ CONTENT - Container principal do menu
const DropdownMenuContent = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
            ref={ref}
            sideOffset={sideOffset}
            className={cn(
                "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                className
            )}
            {...props}
        />
    </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

// ✅ ITEM - Item clicável do menu
const DropdownMenuItem = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: "default" | "destructive" | "success" | "warning";
}
>(({ className, inset, variant = "default", ...props }, ref) => {
    const variantStyles = {
        default: "",
        destructive: "text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-700",
        success: "text-green-600 hover:bg-green-50 focus:bg-green-50 focus:text-green-700",
        warning: "text-orange-600 hover:bg-orange-50 focus:bg-orange-50 focus:text-orange-700",
    };

    return (
        <DropdownMenuPrimitive.Item
            ref={ref}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent/50",
                inset && "pl-8",
                variantStyles[variant],
                className
            )}
            {...props}
        />
    );
});
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

// ✅ CHECKBOX ITEM - Item com checkbox
const DropdownMenuCheckboxItem = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
    <DropdownMenuPrimitive.CheckboxItem
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent/50",
            className
        )}
        checked={checked}
        {...props}
    >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
        {children}
    </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

// ✅ RADIO ITEM - Item com seleção única
const DropdownMenuRadioItem = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.RadioItem
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent/50",
            className
        )}
        {...props}
    >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
        {children}
    </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

// ✅ LABEL - Título/cabeçalho do grupo
const DropdownMenuLabel = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
}
>(({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Label
        ref={ref}
        className={cn("px-2 py-1.5 text-sm font-semibold text-muted-foreground", inset && "pl-8", className)}
        {...props}
    />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

// ✅ SEPARATOR - Linha divisória
const DropdownMenuSeparator = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

// ✅ SHORTCUT - Atalho de teclado
const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
    return <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />;
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// ✅ NOVO: TRIGGER COM ÍCONE - Para facilitar uso comum
const DropdownMenuTriggerWithIcon = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    showChevron?: boolean;
    variant?: "default" | "outline" | "ghost";
}
>(({ className, children, showChevron = true, variant = "outline", ...props }, ref) => {
    const baseStyles =
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variantStyles = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
    };

    return (
        <DropdownMenuPrimitive.Trigger
            ref={ref}
            className={cn(baseStyles, variantStyles[variant], "h-9 px-3", className)}
            {...props}
        >
            {children}
            {showChevron && <ChevronDown className="ml-2 h-4 w-4" />}
        </DropdownMenuPrimitive.Trigger>
    );
});
DropdownMenuTriggerWithIcon.displayName = "DropdownMenuTriggerWithIcon";

// ✅ NOVO: MULTI-SELECT HELPER - Para seleção múltipla de exames
interface DropdownMenuMultiSelectProps {
    options: Array<{ value: string; label: string; category?: string }>;
    value: string[];
    onValueChange: (value: string[]) => void;
    placeholder?: string;
    maxDisplay?: number;
    groupByCategory?: boolean;
}

const DropdownMenuMultiSelect: React.FC<DropdownMenuMultiSelectProps> = ({
                                                                             options,
                                                                             value,
                                                                             onValueChange,
                                                                             placeholder = "Selecionar itens...",
                                                                             maxDisplay = 3,
                                                                             groupByCategory = false,
                                                                         }) => {
    const toggleItem = (itemValue: string) => {
        if (value.includes(itemValue)) {
            onValueChange(value.filter((v) => v !== itemValue));
        } else {
            onValueChange([...value, itemValue]);
        }
    };

    const selectedLabels = value.map((v) => options.find((opt) => opt.value === v)?.label).filter(Boolean);

    const displayText =
        selectedLabels.length === 0
            ? placeholder
            : selectedLabels.length <= maxDisplay
                ? selectedLabels.join(", ")
                : `${selectedLabels.slice(0, maxDisplay).join(", ")} e mais ${selectedLabels.length - maxDisplay}`;

    const groupedOptions = groupByCategory
        ? options.reduce((acc, option) => {
            const category = option.category || "Outros";
            if (!acc[category]) acc[category] = [];
            acc[category].push(option);
            return acc;
        }, {} as Record<string, typeof options>)
        : { Todos: options };

    return (
        <DropdownMenu>
            <DropdownMenuTriggerWithIcon variant="outline" className="w-full justify-between text-left font-normal">
                <span className="truncate">{displayText}</span>
            </DropdownMenuTriggerWithIcon>
            <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
                {Object.entries(groupedOptions).map(([category, items], categoryIndex) => (
                    <React.Fragment key={category}>
                        {groupByCategory && (
                            <>
                                {categoryIndex > 0 && <DropdownMenuSeparator />}
                                <DropdownMenuLabel>{category}</DropdownMenuLabel>
                            </>
                        )}
                        {items.map((option) => (
                            <DropdownMenuCheckboxItem
                                key={option.value}
                                checked={value.includes(option.value)}
                                onCheckedChange={() => toggleItem(option.value)}
                            >
                                {option.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </React.Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// ✅ EXPORTAÇÕES
export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuTriggerWithIcon,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuMultiSelect,
};
