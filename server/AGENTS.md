# server/AGENTS.md

## Module Context

Bun 기반 API 프록시 서버. 프론트엔드의 `/api/*` 요청(`vite.config.ts:9-14` 프록시 설정)을 받아 Anthropic/Google 생성 API를 호출하고, react-live에서 바로 실행 가능한 코드로 정규화해 반환한다.

## Tech Stack & Constraints

- `Bun.serve`만 사용한다 (Express/Fastify 등 프레임워크 도입 금지) — `server/index.ts:138`.
- 외부 HTTP 호출은 전역 `fetch`만 사용한다 (axios 등 별도 HTTP 클라이언트 미도입).
- 포트 `3002` 고정 (`server/index.ts:139`). `vite.config.ts`의 프록시 target과 짝을 이루므로, 포트를 바꾸면 두 파일을 함께 수정한다.

## Implementation Patterns

- 부수효과 없는 텍스트 변환 로직은 `generator.ts`에 순수 함수로 분리한다 (`stripCodeFences`, `ensureRenderCall`).
- 여러 후보 모델을 순서대로 시도하는 로직이 필요하면 `fallback.ts`의 제네릭 헬퍼 `withModelFallback`을 재사용한다. 동일한 재시도 루프를 새로 작성하지 않는다.
- 에러 처리: `err.message`에 담긴 상태 코드 문자열(`'503'`, `'429'`)을 매칭해 사용자용 한국어 메시지로 변환한다 (`server/index.ts:194-206`). 새 에러 케이스를 추가할 때도 이 패턴(문자열 매칭 → 한국어 메시지 → status 매핑)을 따른다.

## Testing Strategy

- `bun run test` (Vitest, `server/**/*.test.ts`).
- 부수효과 없는 함수(`generator.ts`, `fallback.ts`)에는 반드시 단위 테스트를 추가한다.
- `Bun.serve` 핸들러(`index.ts`)는 직접 테스트하지 않는다 — 새 로직은 순수 함수로 뽑아 `generator.ts`/`fallback.ts` 방식으로 테스트한다.

## Local Golden Rules

1. **Security Boundary** — `/api/config`는 `envKeys` boolean만 반환한다. 실제 `ANTHROPIC_API_KEY`/`GOOGLE_API_KEY` 값을 응답 바디나 로그에 절대 포함하지 않는다 (`index.ts:147-157`).
2. **Asymmetry** — `GOOGLE_MODELS` 폴백은 Google 경로 전용이다. Anthropic 호출(`callAnthropic`)에 동일한 폴백을 추가하는 것은 의도된 비대칭을 깨는 변경이므로, 먼저 사용자에게 확인한다 (`index.ts:68-136`).
3. **Hard Constraint** — `SYSTEM_PROMPT`를 수정할 때 "no import statements", "no TypeScript syntax", "call render() at the end" 세 규칙은 반드시 유지한다. 어기면 프론트엔드의 react-live `noInline` 렌더링이 깨진다 (`index.ts:7-49`).
4. **Double Defense** — `render()` 호출 보장은 `SYSTEM_PROMPT` 지시와 `ensureRenderCall` 후처리 두 곳으로 이루어진다. 리팩터링 시 한쪽만 남기지 않는다 (`index.ts:13-16`, `generator.ts:12-24`).
