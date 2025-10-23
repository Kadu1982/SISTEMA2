import { describe, it, expect } from "vitest";
import apiService from "../apiService";

describe("apiService", () => {
    it("deve ter URL base configurada", () => {
        expect(apiService.defaults.baseURL).toBeDefined();
        expect(apiService.defaults.baseURL).toContain("api");
    });

    it("deve ter timeout configurado", () => {
        expect(apiService.defaults.timeout).toBe(10000);
    });

    it("deve ter Content-Type configurado", () => {
        expect(apiService.defaults.headers["Content-Type"]).toBe("application/json");
    });

    it("deve ter Accept header configurado", () => {
        expect(apiService.defaults.headers["Accept"]).toBe("application/json");
    });

    it("deve ser uma instância do Axios", () => {
        expect(apiService.defaults).toBeDefined();
        expect(apiService.get).toBeDefined();
        expect(apiService.post).toBeDefined();
        expect(apiService.put).toBeDefined();
        expect(apiService.delete).toBeDefined();
    });

    it("deve ter interceptors definidos", () => {
        expect(apiService.interceptors).toBeDefined();
        expect(apiService.interceptors.request).toBeDefined();
        expect(apiService.interceptors.response).toBeDefined();
    });
});
