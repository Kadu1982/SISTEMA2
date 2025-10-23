import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, XCircle, ChevronDown, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const multiSelectVariants = cva(
    "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
    {
        variants: {
            variant: {
                default: "border-foreground/10 text-foreground bg-card hover:bg-card/80",
                secondary: "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                inverted: "inverted",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

interface MultiSelectProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof multiSelectVariants> {
    options: {
        label: string;
        value: string;
        icon?: React.ComponentType<{ className?: string }>;
    }[];
    onValueChange: (value: string[]) => void;
    defaultValue?: string[];
    placeholder?: string;
    animation?: number;
    maxCount?: number;
    modalPopover?: boolean;
    asChild?: boolean;
    className?: string;
    disabled?: boolean;
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
    (
        {
            options,
            onValueChange,
            variant,
            defaultValue = [],
            placeholder = "Selecione opções",
            animation = 0,
            maxCount = 3,
            modalPopover = false,
            asChild = false,
            className,
            disabled = false,
            ...props
        },
        ref
    ) => {
        // ✅ ESTADO SIMPLES E ESTÁVEL
        const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue);
        const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
        const [searchTerm, setSearchTerm] = React.useState("");

        // ✅ SINCRONIZAÇÃO APENAS QUANDO defaultValue MUDA DE FATO
        React.useEffect(() => {
            const newKey = defaultValue.sort().join(',');
            const currentKey = selectedValues.sort().join(',');
            if (newKey !== currentKey) {
                console.log('🔄 MultiSelect sync - Atualizando selectedValues');
                setSelectedValues(defaultValue);
            }
        }, [defaultValue.sort().join(',')]); // ✅ Dependência estável usando join

        // ✅ FILTRAR OPÇÕES BASEADO NA BUSCA
        const filteredOptions = React.useMemo(() => {
            if (!searchTerm) return options;
            return options.filter(option =>
                option.label.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }, [options, searchTerm]);

        // ✅ FUNÇÃO DE TOGGLE DIRETA E SIMPLES
        const toggleOption = (optionValue: string) => {
            console.log('🔄 MultiSelect toggleOption:', optionValue);

            const newValues = selectedValues.includes(optionValue)
                ? selectedValues.filter(value => value !== optionValue)
                : [...selectedValues, optionValue];

            console.log('🔄 MultiSelect newValues:', newValues);

            setSelectedValues(newValues);
            onValueChange(newValues);
        };

        // ✅ FUNÇÃO LIMPAR
        const handleClear = () => {
            console.log('🧹 MultiSelect clear');
            setSelectedValues([]);
            onValueChange([]);
        };

        // ✅ FUNÇÃO SELECIONAR/DESMARCAR TODOS
        const toggleAll = () => {
            const allValues = options.map(option => option.value);
            const newValues = selectedValues.length === options.length ? [] : allValues;

            console.log('🔄 MultiSelect toggleAll:', newValues);
            setSelectedValues(newValues);
            onValueChange(newValues);
        };

        console.log('🔍 MultiSelect render:', {
            options: options.length,
            selectedValues: selectedValues.length,
            isOpen: isPopoverOpen
        });

        return (
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={modalPopover}>
                <PopoverTrigger asChild>
                    <Button
                        ref={ref}
                        {...props}
                        disabled={disabled}
                        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                        className={cn(
                            "flex w-full p-2 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit",
                            className
                        )}
                    >
                        {selectedValues.length > 0 ? (
                            <div className="flex justify-between items-center w-full">
                                <div className="flex flex-wrap items-center gap-1">
                                    {selectedValues.slice(0, maxCount).map((value) => {
                                        const option = options.find(o => o.value === value);
                                        return (
                                            <Badge
                                                key={value}
                                                className={cn(multiSelectVariants({ variant }), "text-xs")}
                                                style={{ animationDuration: `${animation}s` }}
                                            >
                                                {option?.label || value}
                                                <XCircle
                                                    className="ml-1 h-3 w-3 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleOption(value);
                                                    }}
                                                />
                                            </Badge>
                                        );
                                    })}
                                    {selectedValues.length > maxCount && (
                                        <Badge className={cn(multiSelectVariants({ variant }), "text-xs")}>
                                            +{selectedValues.length - maxCount} mais
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <XIcon
                                        className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClear();
                                        }}
                                    />
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between w-full">
                                <span className="text-muted-foreground">{placeholder}</span>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </div>
                        )}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[400px] p-0" align="start" sideOffset={8}>
                    <div className="flex h-full w-full flex-col overflow-hidden rounded-md bg-white text-gray-950 shadow-lg border">
                        {/* ✅ CAMPO DE BUSCA SIMPLES */}
                        <div className="p-2 border-b">
                            <Input
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-8"
                            />
                        </div>

                        {/* ✅ LISTA DE OPÇÕES */}
                        <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
                            {filteredOptions.length === 0 ? (
                                <div className="py-6 text-center text-sm text-gray-500">
                                    Nenhuma opção encontrada.
                                </div>
                            ) : (
                                <>
                                    {/* ✅ SELECIONAR TODOS - COMPONENTE NATIVO */}
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log('🔄 Selecionar todos clicado');
                                            toggleAll();
                                        }}
                                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                selectedValues.length === options.length
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50 [&_svg]:invisible"
                                            )}
                                        >
                                            <CheckIcon className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium">
                                            {selectedValues.length === options.length
                                                ? "Desmarcar todos"
                                                : "Selecionar todos"}
                                        </span>
                                    </div>

                                    {/* ✅ ITENS INDIVIDUAIS - COMPONENTES NATIVOS */}
                                    {filteredOptions.map((option) => {
                                        const isSelected = selectedValues.includes(option.value);

                                        const handleItemClick = (e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            console.log('📋 Item clicado:', option.value, 'isSelected:', isSelected);
                                            toggleOption(option.value);
                                        };

                                        return (
                                            <div
                                                key={option.value}
                                                onClick={handleItemClick}
                                                onPointerDown={(e) => {
                                                    console.log('👆 PointerDown:', option.value);
                                                }}
                                                role="button"
                                                tabIndex={0}
                                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                                            >
                                                <div
                                                    className={cn(
                                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                        isSelected
                                                            ? "bg-primary text-primary-foreground"
                                                            : "opacity-50 [&_svg]:invisible"
                                                    )}
                                                >
                                                    <CheckIcon className="h-4 w-4" />
                                                </div>
                                                {option.icon && (
                                                    <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span>{option.label}</span>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        );
    }
);

MultiSelect.displayName = "MultiSelect";