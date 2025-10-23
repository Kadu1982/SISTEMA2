import React from "react";
import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { TIPOS_EXAME } from "../utils/mockData";

interface TipoExameFieldProps {
  form: UseFormReturn<any>;
  isSubmitting?: boolean;
}

const TipoExameField: React.FC<TipoExameFieldProps> = ({
  form,
  isSubmitting = false,
}) => {
  return (
    <FormField
      control={form.control}
      name="tipoExame"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo de Exame</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={isSubmitting}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de exame" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {TIPOS_EXAME.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TipoExameField;
