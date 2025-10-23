import React, { useEffect, useState } from 'react';
import { getPacienteById } from '@/services/pacientesService.ts';
import type { Paciente } from '@/types/paciente/Paciente';

// Módulo de cache simples em memória por sessão
const nomeCache = new Map<number, string>();

export function getCachedPacienteNome(id: number): string | undefined {
  return nomeCache.get(id);
}

interface Props {
  id: number;
  className?: string;
  prefixo?: string; // Ex.: "Paciente"
}

/**
 * Renderiza a identificação do paciente no formato "ID - Nome".
 * Busca o nome do paciente no backend na primeira utilização e mantém um cache em memória.
 */
const PacienteIdNome: React.FC<Props> = ({ id, className, prefixo }) => {
  const [nome, setNome] = useState<string | undefined>(() => nomeCache.get(id));

  useEffect(() => {
    let ativo = true;

    async function carregarNome() {
      try {
        if (nomeCache.has(id)) {
          setNome(nomeCache.get(id));
          return;
        }
        const paciente: Paciente | null = await getPacienteById(id);
        const nomeObtido = paciente?.nomeCompleto || paciente?.nome || undefined;
        if (ativo && nomeObtido) {
          nomeCache.set(id, nomeObtido);
          setNome(nomeObtido);
        }
      } catch (_e) {
        // Em caso de erro, mantemos apenas o ID
      }
    }

    carregarNome();
    return () => { ativo = false; };
  }, [id]);

  const texto = `${prefixo ? prefixo + ' ' : ''}${id}${nome ? ' - ' + nome : ''}`;

  return <span className={className}>{texto}</span>;
};

export default PacienteIdNome;
