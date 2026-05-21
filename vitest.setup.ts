import '@testing-library/jest-dom';

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor(callback) {}
  observe(element) {}
  unobserve(element) {}
  disconnect() {}
}

global.IntersectionObserver = IntersectionObserverMock;
