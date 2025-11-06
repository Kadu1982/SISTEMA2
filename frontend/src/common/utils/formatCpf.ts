/**
 * Formata CPF no formato 000.000.000-00 enquanto o usuário digita
 * @param cpf - String com ou sem formatação
 * @returns CPF formatado no formato 000.000.000-00
 */
export function formatCpf(cpf: string): string {
  if (!cpf) return '';
  
  // Remove todos os caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limited = cleaned.slice(0, 11);
  
  // Aplica a máscara progressivamente
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)}.${limited.slice(3)}`;
  } else if (limited.length <= 9) {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
  } else {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9, 11)}`;
  }
}

/**
 * Remove a formatação do CPF, retornando apenas os dígitos
 * @param cpf - String com ou sem formatação
 * @returns String com apenas os dígitos do CPF
 */
export function unformatCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}
