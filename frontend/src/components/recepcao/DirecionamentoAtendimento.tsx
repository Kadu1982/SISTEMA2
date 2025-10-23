// src/components/recepcao/DirecionamentoAtendimento.tsx

import React from "react";

type DirecionamentoProps = {
  municipe: {
    id: string;
    nome: string;
    cpf: string;
    agendamentos: Array<{
      id: string;
      servico: string;
      horario: string;
    }>;
  };
};

export const DirecionamentoAtendimento: React.FC<DirecionamentoProps> = ({
  municipe,
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Direcionamento para Atendimento
      </h2>

      <p>
        <strong>Munícipe:</strong> {municipe.nome}
      </p>
      <p>
        <strong>CPF:</strong> {municipe.cpf}
      </p>

      <h3 className="text-lg font-semibold mt-4">Agendamentos</h3>
      {municipe.agendamentos.length > 0 ? (
        <ul className="list-disc list-inside">
          {municipe.agendamentos.map((agendamento) => (
            <li key={agendamento.id}>
              {agendamento.servico} - {agendamento.horario}
            </li>
          ))}
        </ul>
      ) : (
        <p>Não há agendamentos para este munícipe.</p>
      )}

      <button
        className="bg-green-500 text-white px-4 py-2 rounded mt-4"
        onClick={() => alert("Recepção concluída e encaminhamento realizado.")}
      >
        Confirmar Direcionamento
      </button>
    </div>
  );
};
