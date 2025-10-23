// src/components/ui/toaster.tsx

// ANOTAÇÃO: Importa os componentes que formam a aparência visual de uma notificação (Toast).
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
// ANOTAÇÃO: Importa o hook 'useToast' que acabamos de corrigir.
import { useToast } from "@/components/ui/use-toast";

// ANOTAÇÃO: O componente 'Toaster' é o responsável por renderizar as notificações na tela.
export function Toaster() {
  // ANOTAÇÃO: O hook 'useToast' é chamado para obter a lista atual de 'toasts' que devem ser exibidos.
  const { toasts } = useToast();

  return (
      // ANOTAÇÃO: 'ToastProvider' é um componente necessário para que os toasts funcionem corretamente.
      // Ele gerencia a lógica de tempo e posicionamento.
      <ToastProvider>
        {/* ANOTAÇÃO: O método 'map' itera sobre o array de toasts e renderiza um componente 'Toast' para cada um. */}
        {toasts.map(function ({ id, title, description, action, ...props }) {
          return (
              // ANOTAÇÃO: O componente 'Toast' é o container visual da notificação.
              // A 'key' é crucial para o React identificar cada elemento da lista de forma única.
              <Toast key={id} {...props}>
                <div className="grid gap-1">
                  {/* ANOTAÇÃO: Renderiza o título do toast, se ele existir. */}
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {/* ANOTAÇÃO: Renderiza a descrição do toast, se ela existir. */}
                  {description && (
                      <ToastDescription>{description}</ToastDescription>
                  )}
                </div>
                {/* ANOTAÇÃO: Renderiza o botão de ação (ex: "Desfazer"), se ele existir. */}
                {action}
                {/* ANOTAÇÃO: Renderiza o botão 'X' para fechar a notificação. */}
                <ToastClose />
              </Toast>
          );
        })}
        {/* ANOTAÇÃO: 'ToastViewport' é o container que posiciona as notificações na tela (ex: canto superior direito). */}
        <ToastViewport />
      </ToastProvider>
  );
}