import { describe, it, expect } from 'vitest';
import { validatePromptLength, MAX_PROMPT_LENGTH } from './promptValidation';

describe('validatePromptLength', () => {
  it('제한보다 짧으면 null(유효)을 반환한다', () => {
    expect(validatePromptLength('짧은 프롬프트')).toBeNull();
  });

  it('정확히 500자면 null(유효)을 반환한다', () => {
    const prompt = 'a'.repeat(MAX_PROMPT_LENGTH);
    expect(validatePromptLength(prompt)).toBeNull();
  });

  it('500자를 초과하면 에러 메시지를 반환한다', () => {
    const prompt = 'a'.repeat(MAX_PROMPT_LENGTH + 1);
    expect(validatePromptLength(prompt)).toBe(
      `프롬프트는 ${MAX_PROMPT_LENGTH}자를 넘을 수 없습니다. (현재 ${MAX_PROMPT_LENGTH + 1}자)`
    );
  });
});
