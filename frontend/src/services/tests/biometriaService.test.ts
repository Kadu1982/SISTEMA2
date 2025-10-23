
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BiometriaService } from "../biometriaService";
import apiService from "../apiService";

// Mock do apiService
vi.mock("../apiService", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

describe("BiometriaService", () => {
    beforeEach(() => {
        // Limpa todos os mocks antes de cada teste
        vi.clearAllMocks();

        // Mock do localStorage para cada teste
        localStorage.setItem("operadorData", JSON.stringify({
            id: 1,
            nome: "Operador Teste"
        }));
    });

    it("deve ler biometria por template com sucesso", async () => {
        // Arrange - prepara o mock
        const mockResponse = {
            data: {
                sucesso: true,
                usuario: {
                    id: 1,
                    usunome: "João Silva",
                    usucpf: "12345678901",
                    usucns: "123456789012345"
                }
            }
        };

        vi.mocked(apiService.get).mockResolvedValue(mockResponse);

        // Act - executa a função
        const resultado = await BiometriaService.lerBiometriaPorTemplate("template123");

        // Assert - verifica o resultado
        expect(resultado.sucesso).toBe(true);
        expect(resultado.usuario?.usunome).toBe("João Silva");
        expect(apiService.get).toHaveBeenCalledWith("/biometria/ler/template123");
    });

    it("deve tratar erro na leitura de biometria", async () => {
        // Arrange
        vi.mocked(apiService.get).mockRejectedValue(new Error("Erro de rede"));

        // Act
        const resultado = await BiometriaService.lerBiometriaPorTemplate("template123");

        // Assert
        expect(resultado.sucesso).toBe(false);
        expect(resultado.erro).toBe("Falha na leitura biométrica");
    });

    it("deve registrar biometria com sucesso", async () => {
        // Arrange
        const mockResponse = {
            data: {
                sucesso: true,
                templateId: "novo-template-123"
            }
        };

        const dadosBiometria = {
            usuarioId: 1,
            templateId: "template123",
            tipo: "digital" as const,
            dispositivoId: "device001",
            qualidade: 85
        };

        vi.mocked(apiService.post).mockResolvedValue(mockResponse);

        // Act
        const resultado = await BiometriaService.registrarBiometria(dadosBiometria);

        // Assert
        expect(resultado.sucesso).toBe(true);
        expect(resultado.templateId).toBe("novo-template-123");
        expect(apiService.post).toHaveBeenCalledWith("/biometria/registrar", dadosBiometria);
    });

    it("deve listar biometrias do usuário", async () => {
        // Arrange
        const mockBiometrias = [
            {
                id: "1",
                templateId: "template123",
                usuarioId: 1,
                tipo: "digital" as const,
                dispositivoId: "device001",
                dataCaptura: "2024-01-01T10:00:00Z",
                qualidade: 85,
                ativo: true
            }
        ];

        vi.mocked(apiService.get).mockResolvedValue({ data: mockBiometrias });

        // Act
        const resultado = await BiometriaService.listarBiometriasUsuario(1);

        // Assert
        expect(resultado).toHaveLength(1);
        expect(resultado[0].templateId).toBe("template123");
        expect(apiService.get).toHaveBeenCalledWith("/biometria/usuario/1");
    });

    it("deve remover biometria com sucesso", async () => {
        // Arrange
        vi.mocked(apiService.delete).mockResolvedValue({ data: {} });

        // Act
        const resultado = await BiometriaService.removerBiometria("bio123", "Solicitação do usuário");

        // Assert
        expect(resultado).toBe(true);
        expect(apiService.delete).toHaveBeenCalledWith("/biometria/bio123", {
            data: {
                motivo: "Solicitação do usuário",
                timestamp: expect.any(String)
            }
        });
    });

    it("deve tratar erro na remoção de biometria", async () => {
        // Arrange
        vi.mocked(apiService.delete).mockRejectedValue(new Error("Erro de rede"));

        // Act
        const resultado = await BiometriaService.removerBiometria("bio123", "Teste");

        // Assert
        expect(resultado).toBe(false);
    });
});
