export interface UpaDTO {
    id?: number;
    pacienteId: number;
    pacienteNome?: string; // Nome do paciente para exibição
    dataHoraRegistro: string; // LocalDateTime do Java será serializada como string ISO
    observacoes?: string;
    dataEntrada?: string;
    horaEntrada?: string;
    status?: string;
    unidadeId?: number;
}