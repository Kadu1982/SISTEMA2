// AULA: Corrigimos e unificamos as interfaces para refletir o que o componente precisa.
// Agora temos um único tipo `Prescricao` que será usado em toda a funcionalidade.
// Note que os nomes dos campos (`id`, `data`, `medicamentos`) agora correspondem
// ao que o componente `AtendimentoFarmacia.tsx` espera.

/**
 * Representa um item de medicamento dentro de uma prescrição ou dispensação.
 * Esta estrutura corresponde aos campos do formulário em `AtendimentoFarmacia.tsx`.
 */
export interface MedicamentoItem {
    nome: string;
    dosagem: string;
    instrucoes: string;
}

/**
 * Representa uma prescrição completa, como é usada pelo componente de atendimentover.
 */
export interface Prescricao {
    id: string; // O uso de `.substring` no componente sugere que o ID é uma string (ex: UUID).
    pacienteId: string;
    nomeMedico: string;
    data: string; // Formato de data em string (ISO 8601)
    medicamentos: MedicamentoItem[];
}

/**
 * Define o formato dos dados para criar uma dispensação avulsa via API.
 */
export interface DispensacaoAvulsaPayload {
    pacienteId: string;
    medicamentos: MedicamentoItem[];
}