import { describe, it, expect, vi, beforeEach } from "vitest";
import apiService from "../apiService";

// Mock do apiService
vi.mock("../apiService", () => ({
    default: {
        get: vi.fn(),
    },
}));

describe("CidService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deve buscar CIDs via apiService", async () => {
        // Arrange
        const mockResponse = {
            data: {
                success: true,
                data: [
                    { id: 1, codigo: "A00", descricao: "Cólera" },
                    { id: 2, codigo: "A01", descricao: "Febres tifóide e paratifóide" }
                ]
            }
        };

        vi.mocked(apiService.get).mockResolvedValue(mockResponse);

        // Act
        const response = await apiService.get("/cids?busca=cólera");

        // Assert
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveLength(2);
        expect(response.data.data[0].codigo).toBe("A00");
        expect(apiService.get).toHaveBeenCalledWith("/cids?busca=cólera");
    });

    it("deve tratar erro na busca de CIDs", async () => {
        // Arrange
        vi.mocked(apiService.get).mockRejectedValue(new Error("Erro de rede"));

        // Act & Assert
        await expect(apiService.get("/cids?busca=inexistente")).rejects.toThrow("Erro de rede");
    });
});
