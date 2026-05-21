import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
process.env.VITE_SUPABASE_URL = "http://localhost:54321"; process.env.VITE_SUPABASE_ANON_KEY = "dummy_key";
import { vi } from "vitest";
window.IntersectionObserver = vi.fn().mockReturnValue({ observe: () => null, unobserve: () => null, disconnect: () => null });
