import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { readStorageValue, writeStorageValue } from '../utils/storage';

export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  hydrate?: (stored: T) => T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const stored = readStorageValue(key, initialValue);
    return hydrate ? hydrate(stored) : stored;
  });

  useEffect(() => {
    writeStorageValue(key, value);
  }, [key, value]);

  return [value, setValue];
}
