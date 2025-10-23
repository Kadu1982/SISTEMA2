import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitText: string;
  cancelText?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
                                                          onCancel,
                                                          onSubmit,
                                                          isSubmitting,
                                                          submitText,
                                                          cancelText = "Cancelar"
                                                        }) => {
  return (
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
        >
          <X className="w-4 h-4 mr-2" />
          {cancelText}
        </Button>
        <Button
            type="submit"
            onClick={onSubmit}
            disabled={isSubmitting}
        >
          {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </>
          ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {submitText}
              </>
          )}
        </Button>
      </div>
  );
};