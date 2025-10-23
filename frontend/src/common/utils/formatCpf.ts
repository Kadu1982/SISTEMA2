export function formatCpf(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "");

  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
