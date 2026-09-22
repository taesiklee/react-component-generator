---
name: create-pr
description: |
  현재 브랜치의 변경사항을 분석해 GitHub Pull Request를 생성한다. 기본은 한국어 PR 템플릿(reference/template.ko.md)을 쓰고, 사용자가 영어를 요청하면 영어 템플릿(reference/template.en.md)을 쓴다.
  "PR 만들어줘", "PR 생성해줘", "pull request 만들어줘", "PR 올려줘", "create a PR", "open a pull request" 같은 요청에 활성화한다.
context: fork
---

# create-pr: GitHub PR 생성

현재 브랜치의 변경사항을 base 브랜치와 비교해 분석하고, PR 템플릿을 채워 GitHub PR을 생성한다. 이 스킬은 `context: fork`로 서브에이전트(포크)에서 실행된다 — 메인 세션 컨텍스트를 소모하지 않고, 완료 후 PR URL과 요약만 보고한다.

## 워크플로우

### Step 0: 사전 확인

- 현재 디렉토리가 git 저장소인지, `gh auth status`로 GitHub 인증이 되어 있는지 확인한다. 인증이 안 되어 있으면 사용자에게 알리고 중단한다.
- base 브랜치를 결정한다: 사용자가 명시하면 그것을 쓰고, 아니면 `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`(실패 시 `git remote show origin`)으로 저장소 기본 브랜치를 확인한다.
- 저장소 루트의 `AGENTS.md`/`CLAUDE.md`에 PR 제목·본문 컨벤션이 명시되어 있으면 **그것을 최우선으로 따르고**, 이 스킬의 기본 템플릿은 그런 규칙이 없을 때만 쓴다.

### Step 1: 변경사항 분석

- `git status`, 현재 브랜치가 원격을 추적 중인지, `git log base...HEAD`와 `git diff base...HEAD`로 base 브랜치 분기 이후 전체 변경사항을 파악한다. 최신 커밋 하나만 보지 않는다.
- 커밋되지 않은 변경(staged/unstaged/untracked)이 있으면 먼저 사용자에게 알린다. 이 스킬은 PR 생성이 목적이므로 임의로 커밋하지 않는다 — 커밋이 필요하면 사용자에게 커밋 여부를 확인한다.
- 로컬 커밋이 원격에 push되어 있지 않으면 push가 필요함을 알리고, 진행 여부를 확인한 뒤 push한다.

### Step 2: 템플릿 선택

- **기본값은 한국어 템플릿**(`reference/template.ko.md`)이다.
- 사용자가 "영어로", "in English", "영문 PR" 등으로 명시한 경우에만 영어 템플릿(`reference/template.en.md`)을 쓴다.

### Step 3: 템플릿 채우기

- 템플릿의 각 섹션을 채울 때 커밋 메시지를 그대로 나열하지 말고, Step 1에서 분석한 diff 전체를 근거로 **왜** 바뀌었는지 요약한다.
- 테스트/검증 섹션에는 실제로 실행해서 확인한 항목만 적는다. 실행하지 않은 검증을 지어내지 않는다.
- 시스템 프롬프트에 PR 본문 attribution(예: `🤖 Generated with Claude Code` 줄) 지침이 있으면 본문 마지막에 반드시 포함한다.

### Step 4: PR 생성

- 제목은 70자 이내로 간결하게 작성한다.
- 본문은 항상 heredoc으로 전달해 포맷이 깨지지 않게 한다:

```bash
gh pr create --title "제목" --base "{base 브랜치}" --body "$(cat <<'EOF'
{Step 3에서 채운 템플릿 내용}
EOF
)"
```

- 사용자가 draft를 명시하면 `--draft`를 추가한다.
- 생성이 끝나면 반환된 PR URL을 최종 보고에 포함한다.

## 주의사항

- 현재 브랜치에 **이미 열린 PR이 있으면** 새로 만들지 않는다. 기존 PR URL을 알리고 어떻게 할지 사용자에게 확인한다(중복 생성 방지).
- base와 현재 브랜치가 같으면(예: `main`에서 그대로 PR을 만들려는 경우) 새 브랜치가 필요함을 안내하고 중단한다.
- push, PR 생성처럼 원격/공유 상태에 영향을 주는 작업은 사용자가 이미 명시적으로 요청한 범위 내에서만 수행한다.
