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
import { MEDICOS } from "../utils/mockData";

interface MedicoFieldProps {
  form: UseFormReturn<any>;
  isSubmitting?: boolean;
}

const MedicoField: React.FC<MedicoFieldProps> = ({
  form,
  isSubmitting = false,
}) => {
  return (
    <FormField
      control={form.control}
      name="medico"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Médico Solicitante</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={isSubmitting}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o médico" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {MEDICOS.map((medico) => (
                <SelectItem key={medico} value={medico}>
                  {medico}
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

export default MedicoField;
