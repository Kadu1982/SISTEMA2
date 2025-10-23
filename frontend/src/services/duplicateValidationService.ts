import { Paciente } from "@/types/paciente/Paciente";
import { pacientes } from "@/data/mockData";

export interface PatientData {
  nome: string;
  dataNascimento?: string;
  nomeMae?: string | null;
  cpfMae?: string | null;
}

export interface ValidationResult {
  isDuplicate: boolean;
  confidence?: number;
  possibleDuplicates: Paciente[];
  aiAnalysis: string;
}

export interface ValidationConfig {
  strictness?: "low" | "medium" | "high";
  validateNewborns?: boolean;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const validatePatientDuplicate = async (
  patientData: PatientData,
  config?: ValidationConfig,
): Promise<ValidationResult> => {
  console.log("Iniciando validacao para:", patientData);
  console.log("Configuracao:", config);

  await delay(1500);

  const nomeBusca = patientData.nome?.toLowerCase().trim();
  if (!nomeBusca) {
    return {
      isDuplicate: false,
      possibleDuplicates: [],
      confidence: 0.9,
      aiAnalysis: "Dados insuficientes para validar",
    };
  }

  const nomeMaeBusca = patientData.nomeMae?.toLowerCase().trim() ?? null;
  const dataNascimentoBusca = patientData.dataNascimento?.trim() ?? null;

  const possibleDuplicates = pacientes.filter((p: Paciente) => {
    const nomePaciente = p.nome?.toLowerCase().trim();
    if (!nomePaciente) {
      return false;
    }

    if (config?.validateNewborns === false && !patientData.nomeMae) {
      return false;
    }

    const nameMatch = nomePaciente === nomeBusca;
    const motherNameMatch = (p.nomeMae?.toLowerCase().trim() ?? null) === nomeMaeBusca;
    const birthDateMatch = dataNascimentoBusca ? p.dataNascimento === dataNascimentoBusca : false;

    return nameMatch && (motherNameMatch || birthDateMatch);
  });

  if (possibleDuplicates.length > 0) {
    return {
      isDuplicate: true,
      possibleDuplicates,
      confidence: 0.95,
      aiAnalysis: "Alta probabilidade de duplicata",
    };
  }

  return {
    isDuplicate: false,
    possibleDuplicates: [],
    confidence: 0.99,
    aiAnalysis: "Nenhuma duplicata encontrada",
  };
};
