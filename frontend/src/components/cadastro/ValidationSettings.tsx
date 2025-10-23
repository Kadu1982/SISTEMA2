import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ValidationConfig } from "@/services/duplicateValidationService";

interface ValidationSettingsProps {
  config: ValidationConfig;
  onConfigChange: (config: ValidationConfig) => void;
}

export const ValidationSettings: React.FC<ValidationSettingsProps> = ({
  config,
  onConfigChange,
}) => {
  const handleToggleNewborns = () => {
    onConfigChange({
      ...config,
      validateNewborns: !config.validateNewborns,
    });
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <Switch
        id="validateNewborns"
        checked={config.validateNewborns}
        onCheckedChange={handleToggleNewborns}
      />
      <Label htmlFor="validateNewborns">
        Habilitar validação de recém-nascidos (exibe campos da mãe)
      </Label>
    </div>
  );
};
