import { describe, it, expect } from 'vitest';
import { addPromptToHistory, MAX_PROMPT_HISTORY } from './promptHistory';

describe('addPromptToHistory', () => {
  it('새 프롬프트를 맨 앞에 추가한다', () => {
    expect(addPromptToHistory([], '첫 프롬프트')).toEqual(['첫 프롬프트']);
    expect(addPromptToHistory(['기존'], '새 프롬프트')).toEqual(['새 프롬프트', '기존']);
  });

  it('이미 있는 프롬프트를 다시 추가하면 중복 없이 맨 앞으로 옮긴다', () => {
    expect(addPromptToHistory(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c']);
  });

  it(`최대 ${MAX_PROMPT_HISTORY}개까지만 유지하고 오래된 항목을 버린다`, () => {
    const full = Array.from({ length: MAX_PROMPT_HISTORY }, (_, i) => `p${i}`);
    const result = addPromptToHistory(full, 'new');

    expect(result).toHaveLength(MAX_PROMPT_HISTORY);
    expect(result[0]).toBe('new');
    expect(result).not.toContain(`p${MAX_PROMPT_HISTORY - 1}`);
  });
});
