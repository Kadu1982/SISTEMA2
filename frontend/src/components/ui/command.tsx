import React from "react";
import { cn } from "@/lib/utils";

interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Command = React.forwardRef<HTMLDivElement, CommandProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "flex h-full w-full flex-col overflow-hidden rounded-md bg-white text-gray-950",
                className
            )}
            {...props}
        />
    )
);
Command.displayName = "Command";

export const CommandInput = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
    <input
        ref={ref}
        className={cn(
            "flex h-11 w-full rounded-md bg-transparent py-3 px-4 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50",
            className
        )}
        {...props}
    />
));
CommandInput.displayName = "CommandInput";

export const CommandList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
        {...props}
    />
));
CommandList.displayName = "CommandList";

export const CommandEmpty = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("py-6 text-center text-sm", className)}
        {...props}
    />
));
CommandEmpty.displayName = "CommandEmpty";

export const CommandGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "overflow-hidden p-1 text-gray-950 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500",
            className
        )}
        {...props}
    />
));
CommandGroup.displayName = "CommandGroup";

export const CommandItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            className
        )}
        {...props}
    />
));
CommandItem.displayName = "CommandItem";