// src/components/biometria/LeitorBiometrico.tsx
import React from "react";
import { useBiometrias, useCriarBiometria } from "../../hooks/useBiometria";
import { Button } from "../ui/button";

interface Props {
  usuarioId: number;
}

export const LeitorBiometrico: React.FC<Props> = ({ usuarioId }) => {
  const { data: biometrias, isLoading } = useBiometrias(usuarioId);
  const { mutate: registrarBiometria, isPending: isSalvando } =
    useCriarBiometria();

  const simularLeitura = () => {
    registrarBiometria({
      usuarioId,
      templateId: `BIO${Math.floor(Math.random() * 1000000)}`,
      tipo: "digital",
      dispositivoId: "leitor-01",
    });
  };

  return (
    <div>
      <Button onClick={simularLeitura} disabled={isSalvando}>
        {isSalvando ? "Registrando..." : "Simular Leitura Biométrica"}
      </Button>

      <div className="mt-4">
        <h3 className="font-semibold">Últimas biometrias</h3>
        {isLoading ? (
          <p>Carregando...</p>
        ) : (
          <ul className="text-sm">
            {biometrias?.map((b) => (
              <li key={b.id}>
                {b.templateId} — {new Date(b.dataCaptura).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
