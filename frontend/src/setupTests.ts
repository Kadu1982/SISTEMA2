import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock localStorage - ✅ CORRIGIDO para Vitest
Object.defineProperty(window, "localStorage", {
    value: {
        getItem: vi.fn(),    // ✅ vi.fn() ao invés de jest.fn()
        setItem: vi.fn(),    // ✅ vi.fn() ao invés de jest.fn()
        removeItem: vi.fn(), // ✅ vi.fn() ao invés de jest.fn()
        clear: vi.fn(),      // ✅ vi.fn() ao invés de jest.fn()
    },
    writable: true,
});

// Mock window.location
Object.defineProperty(window, "location", {
    value: {
        href: "http://localhost:3000",
        protocol: "http:",
        hostname: "localhost",
        port: "3000",
    },
    writable: true,
});

// Mock navigator.userAgent (usado no biometriaService)
Object.defineProperty(navigator, "userAgent", {
    value: "Mozilla/5.0 (Test Environment)",
    writable: true,
});

// Mock console methods para testes mais limpos
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});
vi.spyOn(console, "warn").mockImplementation(() => {});