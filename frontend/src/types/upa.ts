export interface UpaDTO {
    id?: number;
    pacienteId: number;
    dataHoraRegistro: string; // LocalDateTime do Java será serializada como string ISO
    observacoes?: string;
}