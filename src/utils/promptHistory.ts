export const MAX_PROMPT_HISTORY = 20;

export function addPromptToHistory(history: string[], prompt: string): string[] {
  const withoutDuplicate = history.filter((entry) => entry !== prompt);
  return [prompt, ...withoutDuplicate].slice(0, MAX_PROMPT_HISTORY);
}
