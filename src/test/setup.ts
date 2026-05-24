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
process.env.VITE_SUPABASE_URL = "http://localhost:54321"; process.env.VITE_SUPABASE_ANON_KEY = "anon_key";
global.IntersectionObserver = class IntersectionObserver { constructor() {} observe() {} unobserve() {} disconnect() {} };
global.ResizeObserver = class ResizeObserver { constructor() {} observe() {} unobserve() {} disconnect() {} };
