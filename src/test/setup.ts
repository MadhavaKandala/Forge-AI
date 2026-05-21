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
process.env.VITE_SUPABASE_URL = 'http://localhost';
process.env.VITE_SUPABASE_ANON_KEY = 'test';
class MockIntersectionObserver { observe() {} unobserve() {} disconnect() {} } window.IntersectionObserver = MockIntersectionObserver as any;
