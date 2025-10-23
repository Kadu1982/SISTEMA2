import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Bot, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import axios from "axios";

export const IAAssistant = () => {
  const [mensagem, setMensagem] = useState("");
  const [conversa, setConversa] = useState<
      Array<{ tipo: "usuario" | "ia"; texto: string }>
  >([
    {
      tipo: "ia",
      texto:
          "Olá! Sou o assistente de IA do Sistema de Saúde. Como posso ajudar você hoje?",
    },
  ]);
  const [carregando, setCarregando] = useState(false);

  const enviarMensagem = async () => {
    if (mensagem.trim() === "") return;

    const novaMensagem = { tipo: "usuario", texto: mensagem };
    setConversa((prev) => [...prev, novaMensagem]);
    setCarregando(true);

    try {
      const resposta = await axios.post("/api/ia/chat", {
        mensagem: mensagem,
      });

      setConversa((prev) => [
        ...prev,
        { tipo: "ia", texto: resposta.data.resposta },
      ]);
    } catch (erro) {
      console.error("Erro ao consultar IA:", erro);
      setConversa((prev) => [
        ...prev,
        {
          tipo: "ia",
          texto: "Desculpe, não consegui obter uma resposta no momento.",
        },
      ]);
    } finally {
      setCarregando(false);
      setMensagem("");
    }
  };

  return (
      <div className="p-4 border rounded-md max-w-3xl mx-auto shadow">
        <ScrollArea className="h-80 border rounded p-2 bg-muted mb-4">
          {conversa.map((mensagem, index) => (
              <div
                  key={index}
                  className={cn("flex items-start mb-2", {
                    "justify-end": mensagem.tipo === "usuario",
                  })}
              >
                <div
                    className={cn(
                        "rounded-lg p-3 max-w-[80%]",
                        mensagem.tipo === "usuario"
                            ? "bg-primary text-white"
                            : "bg-white border"
                    )}
                >
                  <div className="flex items-center gap-2 text-sm">
                    {mensagem.tipo === "usuario" ? (
                        <>
                          <User className="w-4 h-4" />
                          <span>Você</span>
                        </>
                    ) : (
                        <>
                          <Bot className="w-4 h-4 text-green-600" />
                          <span>IA</span>
                        </>
                    )}
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{mensagem.texto}</p>
                </div>
              </div>
          ))}
          {carregando && (
              <div className="text-sm text-muted-foreground">IA está digitando...</div>
          )}
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Digite sua pergunta..."
              className="flex-1 resize-none"
          />
          <Button onClick={enviarMensagem} disabled={carregando}>
            <Send className="h-4 w-4 mr-1" />
            Enviar
          </Button>
        </div>
      </div>
  );
};

export default IAAssistant;
