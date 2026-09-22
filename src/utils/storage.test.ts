import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readStorageValue, writeStorageValue } from './storage';

describe('readStorageValue / writeStorageValue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('저장된 값이 없으면 fallback을 반환한다', () => {
    expect(readStorageValue('missing-key', 'fallback')).toBe('fallback');
  });

  it('쓴 값을 그대로 읽어온다 (round trip)', () => {
    writeStorageValue('key', { a: 1, b: ['x', 'y'] });
    expect(readStorageValue('key', null)).toEqual({ a: 1, b: ['x', 'y'] });
  });

  it('저장된 값이 손상된 JSON이면 fallback을 반환한다', () => {
    localStorage.setItem('broken', '{not valid json');
    expect(readStorageValue('broken', 'fallback')).toBe('fallback');
  });

  it('localStorage.setItem이 예외를 던져도 조용히 무시한다', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => writeStorageValue('key', 'value')).not.toThrow();

    spy.mockRestore();
  });
});
