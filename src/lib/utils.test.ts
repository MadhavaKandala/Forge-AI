import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge standard classes', () => {
    expect(cn('px-2 py-1', 'bg-red-500')).toBe('px-2 py-1 bg-red-500');
  });

  it('should override tailwind classes', () => {
    expect(cn('p-2', 'p-3')).toBe('p-3');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should handle conditional classes', () => {
    expect(cn('text-sm', false && 'py-1', true && 'p-3')).toBe('text-sm p-3');
  });

  it('should handle object syntax', () => {
    expect(cn('px-2', { 'bg-red-500': true, 'text-white': false })).toBe('px-2 bg-red-500');
  });

  it('should handle arrays', () => {
    expect(cn(['px-2', 'py-1'], ['bg-red-500'])).toBe('px-2 py-1 bg-red-500');
  });

  it('should handle falsy values', () => {
    expect(cn('px-2', null, undefined, 0, false, '', 'py-1')).toBe('px-2 py-1');
  });
});
