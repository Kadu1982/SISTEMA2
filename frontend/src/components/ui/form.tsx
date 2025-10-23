// src/components/ui/form.tsx
// -----------------------------------------------------------------------------
// Adaptado do template shadcn/ui.
// Patch aplicado no FormControl:
// - Valida o filho (children) antes de passar para o <Slot/> do Radix.
// - Se o filho não for um único ReactElement (ex.: null, false, string, array,
//   fragment com vários nós), renderiza um <div> neutro para não quebrar a UI
//   e mostra um console.error em ambiente de desenvolvimento.
// -----------------------------------------------------------------------------

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
    FormProvider,
    useFormContext,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = FormProvider;

// ----------------------- Contexto do FormField -----------------------

type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
    {} as FormFieldContextValue
);

const useFormFieldContext = () => {
    const ctx = React.useContext(FormFieldContext);
    if (!ctx || !("name" in ctx)) {
        throw new Error("useFormFieldContext deve ser usado dentro de <FormField/>");
    }
    return ctx;
};

const FormItemContext = React.createContext<{ id: string }>({ id: "" });

// ----------------------- Hooks auxiliares -----------------------

function useFormField() {
    const { name } = useFormFieldContext();
    const formContext = useFormContext();

    // IDs para acessibilidade
    const id = React.useId();
    const formItemId = `form-item-${id}`;
    const formDescriptionId = `form-item-description-${id}`;
    const formMessageId = `form-item-message-${id}`;

    const fieldState = formContext.getFieldState(name, formContext.formState);
    const error = fieldState.error;

    return {
        name,
        formItemId,
        formDescriptionId,
        formMessageId,
        error,
    };
}

// ----------------------- Componentes -----------------------

const FormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
      ...props
  }: ControllerProps<TFieldValues, TName>) => {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    );
};

const FormItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const id = React.useId();
    return (
        <FormItemContext.Provider value={{ id }}>
            <div ref={ref} className={cn("space-y-2", className)} {...props} />
        </FormItemContext.Provider>
    );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
    const { formItemId, error } = useFormField();
    return (
        <Label
            ref={ref}
            className={cn(error && "text-destructive", className)}
            htmlFor={formItemId}
            {...props}
        />
    );
});
FormLabel.displayName = "FormLabel";

// ----------------------- PATCH: FormControl tolerante -----------------------
const FormControl = React.forwardRef<
    React.ElementRef<typeof Slot>,
    React.ComponentPropsWithoutRef<typeof Slot> & { children?: React.ReactNode }
>(({ children, ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId, name } =
        useFormField();

    const ariaDescribedBy = !error
        ? `${formDescriptionId}`
        : `${formDescriptionId} ${formMessageId}`;

    const isValidChild = React.isValidElement(children);

    // Em dev, ajuda a localizar o campo problemático
    if (process.env.NODE_ENV !== "production" && !isValidChild) {
        if (children !== undefined && children !== null && children !== false) {
            // eslint-disable-next-line no-console
            console.error(
                `[FormControl] O campo "${String(
                    name
                )}" recebeu um filho inválido para <Slot/>:`,
                children
            );
        }
    }

    // Caso inválido (null/false/string/array/fragment múltiplo), evita quebrar a UI.
    if (!isValidChild) {
        return (
            <div
                ref={ref as any}
                id={formItemId}
                aria-describedby={ariaDescribedBy}
                aria-invalid={!!error}
                className="contents"
                {...props}
            >
                {children ?? null}
            </div>
        );
    }

    // Caminho normal: exatamente um ReactElement -> Radix Slot clona corretamente.
    return (
        <Slot
            ref={ref}
            id={formItemId}
            aria-describedby={ariaDescribedBy}
            aria-invalid={!!error}
            {...props}
        >
            {children}
        </Slot>
    );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();
    return (
        <p
            ref={ref}
            id={formDescriptionId}
            className={cn("text-[0.8rem] text-muted-foreground", className)}
            {...props}
        />
    );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error.message) : children;

    if (!body) {
        return null;
    }

    return (
        <p
            ref={ref}
            id={formMessageId}
            className={cn("text-[0.8rem] font-medium text-destructive", className)}
            {...props}
        >
            {body}
        </p>
    );
});
FormMessage.displayName = "FormMessage";

export {
    useFormField,
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField,
};
