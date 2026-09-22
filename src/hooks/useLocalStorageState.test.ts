import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorageState } from './useLocalStorageState';

describe('useLocalStorageState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('localStorage에 값이 없으면 초기값을 사용한다', () => {
    const { result } = renderHook(() => useLocalStorageState('count', 0));
    expect(result.current[0]).toBe(0);
  });

  it('localStorage에 이미 값이 있으면 그 값으로 초기화한다', () => {
    localStorage.setItem('count', JSON.stringify(42));
    const { result } = renderHook(() => useLocalStorageState('count', 0));
    expect(result.current[0]).toBe(42);
  });

  it('setter로 값을 바꾸면 localStorage에도 반영된다', () => {
    const { result } = renderHook(() => useLocalStorageState('count', 0));

    act(() => {
      result.current[1](5);
    });

    expect(result.current[0]).toBe(5);
    expect(JSON.parse(localStorage.getItem('count')!)).toBe(5);
  });

  it('새로 렌더링된 훅은 이전에 저장된 값을 이어받는다 (새로고침 시뮬레이션)', () => {
    const { result, unmount } = renderHook(() => useLocalStorageState('count', 0));
    act(() => {
      result.current[1](7);
    });
    unmount();

    const { result: nextResult } = renderHook(() => useLocalStorageState('count', 0));
    expect(nextResult.current[0]).toBe(7);
  });

  it('hydrate 함수를 넘기면 읽은 값을 가공해서 초기값으로 쓴다', () => {
    localStorage.setItem('createdAt', JSON.stringify('2024-01-01T00:00:00.000Z'));

    const { result } = renderHook(() =>
      useLocalStorageState('createdAt', new Date(0), (raw) => new Date(raw as unknown as string))
    );

    expect(result.current[0]).toEqual(new Date('2024-01-01T00:00:00.000Z'));
  });
});
