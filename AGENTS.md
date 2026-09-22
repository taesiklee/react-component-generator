# AGENTS.md

## Operational Commands

- 패키지 매니저: Bun 고정 (`bun.lock` 존재). npm/yarn/pnpm 사용 금지.
- `bun install` — 의존성 설치.
- `bun run dev` — API 서버(3002) + Vite 프론트엔드(5173) 동시 실행.
- `bun run server` — API 서버만 실행 (`bun --watch run server/index.ts`).
- `bun run build` — `tsc -b && vite build`.
- `bun run lint` — `eslint .`.
- `bun run test` / `bun run test:watch` — Vitest (`server/**/*.test.ts`, `src/**/*.test.{ts,tsx}`).
- `.env`에 `ANTHROPIC_API_KEY` / `GOOGLE_API_KEY` 설정 가능(선택). 없으면 UI에서 직접 입력해 사용한다.

## Golden Rules

1. **Security Boundary — 서버는 API 키 값을 절대 응답에 포함하지 않는다.**
   `/api/config`는 `envKeys: { anthropic: boolean, google: boolean }` 형태로 키 보유 여부만 반환한다 (`server/index.ts:147-157`). 새 엔드포인트를 추가할 때도 실제 키 값을 응답 바디나 로그에 남기지 않는다.

2. **Hard Constraint — 생성된 컴포넌트 코드는 TS 문법·import가 없는 순수 JS여야 하고 `render(<Component />)`로 끝나야 한다.**
   react-live가 `noInline` 모드로 코드를 직접 실행하기 때문이다 (`server/index.ts:7-49`의 SYSTEM_PROMPT, `src/components/LivePreview.tsx:14`). 이 계약을 깨는 변경(TS 허용, import 허용 등)은 미리보기 렌더링 자체를 깨뜨린다.

3. **Double Defense — `render()` 호출 보장은 두 곳에서 방어한다.**
   SYSTEM_PROMPT가 AI에게 명시적으로 지시하고 (`server/index.ts:13-16`), 후처리 함수 `ensureRenderCall`이 누락 시 자동 주입한다 (`server/generator.ts:12-24`, 적용부 `server/index.ts:188`). 한쪽만 남기고 다른 쪽을 제거하지 않는다.

4. **Test Boundary — 부수효과 없는 로직만 단위 테스트 대상이다.**
   `server/generator.ts`, `server/fallback.ts`는 부수효과가 없어 테스트가 존재하지만(`server/generator.ts:1-2` 주석 참고), `server/index.ts`의 `Bun.serve` 핸들러 자체는 테스트하지 않는다. 새 로직을 추가할 때도 순수 함수로 분리해 테스트 가능하게 유지하는 패턴을 따른다.

5. **Asymmetry — Google 호출에만 모델 폴백이 있고 Anthropic에는 없다.**
   `GOOGLE_MODELS` 배열과 `withModelFallback`은 Google 경로에만 적용된다 (`server/index.ts:68-96` vs `98-136`). 의도된 비대칭이므로 대칭을 맞추기 위해 임의로 추가/제거하지 말고, 필요하면 먼저 사용자에게 확인한다.

## Project Context

React 프롬프트를 입력받아 AI(Anthropic Claude 또는 Google Gemini)로 React 컴포넌트를 생성하고, 실시간 미리보기와 코드를 함께 제공하는 워크벤치.

**Tech Stack**: React 19, TypeScript, Vite, Bun(API 서버), react-live, Anthropic API / Google Gemini API, Vitest + Testing Library.

## Standards & References

- 코딩 컨벤션: `eslint.config.js` 참고 (`js.configs.recommended` + `typescript-eslint recommended` + `react-hooks` + `react-refresh`).
- 테스트: Vitest + jsdom, 각 테스트 후 `src/test/setup.ts`에서 `cleanup()` 수행.
- **Maintenance Policy**: 코드와 이 문서의 내용이 어긋나는 것을 발견하면, 코드를 임의로 이 문서에 맞추지 말고 이 문서의 업데이트를 사용자에게 제안한다.

## Context Map

- **[API 서버 / AI 프로바이더 연동](./server/AGENTS.md)** — `server/` 하위 파일 수정 시.
