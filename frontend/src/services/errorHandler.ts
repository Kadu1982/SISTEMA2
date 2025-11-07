import { toast } from "@/components/ui/use-toast";

export interface ApiErrorData {
  success?: boolean;
  message?: string;
  data?: {
    userRoles?: string[];
    [key: string]: any;
  };
  error?: string;
  valoresValidos?: string[];
  statusRecebido?: string;
}

export interface ParsedError {
  status: number;
  message: string;
  userRoles?: string[];
  validValues?: string[];
  receivedValue?: string;
  details?: any;
}

/**
 * Parse de erro da API para formato consumível
 */
export const parseApiError = (error: any): ParsedError => {
  const status = error?.response?.status || 500;
  const data = error?.response?.data as ApiErrorData;
  
  return {
    status,
    message: data?.message || data?.error || error?.message || "Erro desconhecido",
    userRoles: data?.data?.userRoles,
    validValues: data?.valoresValidos,
    receivedValue: data?.statusRecebido,
    details: data?.data,
  };
};

/**
 * Exibe toast de erro com feedback apropriado
 */
export const showErrorToast = (error: ParsedError, duration?: number) => {
  // 🔐 Erro de acesso negado - mostrar permissões
  if (error.status === 403) {
    const roles = error.userRoles?.length 
      ? error.userRoles.join(", ")
      : "Nenhuma";
    
    const description = 
      `${error.message}\n\n` +
      `🔐 Suas permissões atuais: ${roles}\n` +
      `Entre em contato com o administrador para obter as permissões necessárias.`;
    
    toast({
      title: "Acesso Negado",
      description,
      variant: "destructive",
      duration: duration || 10000,
    });
    return;
  }
  
  // ❌ Erro de validação - mostrar valores válidos
  if (error.status === 400) {
    let description = error.message;
    
    if (error.validValues?.length) {
      description += `\n\nValores válidos:\n${error.validValues.join(", ")}`;
    }
    
    if (error.receivedValue) {
      description += `\n\nValor recebido: ${error.receivedValue}`;
    }
    
    toast({
      title: "Erro de Validação",
      description,
      variant: "destructive",
      duration: duration || 5000,
    });
    return;
  }
  
  // 🔓 Erro de autenticação
  if (error.status === 401) {
    toast({
      title: "Autenticação Necessária",
      description: error.message + "\n\nFaça login novamente.",
      variant: "destructive",
      duration: duration || 5000,
    });
    return;
  }
  
  // 🔍 Erro genérico
  toast({
    title: "Erro",
    description: error.message,
    variant: "destructive",
    duration: duration || 3000,
  });
};

/**
 * Wrapper para chamadas API com tratamento de erro
 */
export const handleApiRequest = async <T>(
  fn: () => Promise<T>,
  options?: {
    successMessage?: string;
    errorDuration?: number;
    showSuccess?: boolean;
  }
): Promise<{ success: boolean; data?: T; error?: ParsedError }> => {
  try {
    const data = await fn();
    
    if (options?.showSuccess !== false && options?.successMessage) {
      toast({
        title: "Sucesso!",
        description: options.successMessage,
        className: "bg-green-100 text-green-800",
      });
    }
    
    return { success: true, data };
  } catch (error: any) {
    const parsedError = parseApiError(error);
    showErrorToast(parsedError, options?.errorDuration);
    return { success: false, error: parsedError };
  }
};

