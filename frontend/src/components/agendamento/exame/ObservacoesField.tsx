import React from "react";
import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface ObservacoesFieldProps {
  form: UseFormReturn<any>;
  isSubmitting?: boolean;
}

const ObservacoesField: React.FC<ObservacoesFieldProps> = ({
  form,
  isSubmitting = false,
}) => {
  return (
    <FormField
      control={form.control}
      name="observacoes"
      render={({ field }) => (
        <FormItem className="md:col-span-2">
          <FormLabel>Observações</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Observações sobre o exame, preparos necessários, etc."
              className="resize-none min-h-[100px]"
              {...field}
              disabled={isSubmitting}
            />
          </FormControl>
          <FormDescription>
            Inclua qualquer informação adicional relevante para o exame
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ObservacoesField;
