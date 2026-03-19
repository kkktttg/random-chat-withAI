# 랜덤채팅 + AI

익명 랜덤채팅 서비스. 상대가 사람인지 AI인지 판별하는 **AI찾기** 모드를 포함합니다.

## 기능

### 자유 랜덤채팅
- 랜덤 익명 닉네임 자동 부여 (`익명의[동물][숫자]` 형식)
- 대기자 있으면 즉시 매칭, 없으면 15초 후 AI와 연결
- 나가기 / 다음 상대 기능
- 대화 종료 시 모든 채팅 기록 자동 삭제

### AI찾기 모드
- 상대가 AI인지 사람인지 맞추는 게임
- 최대 5회 대화 후 판별 (진행 중 조기 판별 가능)
- 30초 배치 매칭 (짝수 대기자끼리 매칭, 잉여 인원은 AI 연결)
- AI 응답은 5~10초 인위적 지연 (사람처럼 행동)

### 기타
- 다크모드 토글

## 기술 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| UI | shadcn/ui + Tailwind CSS v4 |
| 상태 관리 | React Context + useReducer |
| 데이터 저장 | Vercel KV (Redis) |
| 실시간 통신 | Polling (2.5초 간격) |
| AI API | Zhipu AI GLM-4-Flash |
| 테스트 | Vitest + Testing Library |
| 패키지 매니저 | Bun |

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 값을 설정합니다.

```env
# Vercel KV (Redis) — Vercel 대시보드 > Storage > KV에서 발급
KV_REST_API_URL=https://your-kv-url.kv.vercel-storage.com
KV_REST_API_TOKEN=your_kv_rest_api_token

# Zhipu AI GLM API Key — https://open.bigmodel.cn 에서 발급
# 무료 플랜: GLM-4-Flash 모델 사용 가능 (100만 토큰/월)
GLM_API_KEY=your_glm_api_key
```

### `KV_REST_API_URL` / `KV_REST_API_TOKEN`

[Vercel KV](https://vercel.com/docs/storage/vercel-kv) 스토리지에서 발급합니다.

1. Vercel 대시보드 → **Storage** 탭 → **Create Database** → **KV** 선택
2. 데이터베이스 생성 후 **.env.local** 탭에서 두 값 복사

### `GLM_API_KEY`

[Zhipu AI 오픈플랫폼](https://open.bigmodel.cn)에서 발급합니다.

1. 회원가입 후 우측 상단 **API Keys** 메뉴 클릭
2. **Create API Key** 버튼으로 키 생성
3. 무료 플랜으로 **GLM-4-Flash** 모델 사용 가능 (월 100만 토큰)

## 로컬 실행

```bash
# 의존성 설치
bun install

# 개발 서버 시작 (Node.js v20.9.0+ 필요)
bun dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기.

> **주의**: Next.js 16은 Node.js v20.9.0 이상을 요구합니다.

## 테스트

```bash
bun run test
```

| 파일 패턴 | 용도 |
|---|---|
| `*.spec.test.tsx` | 수용 기준 테스트 (`artifacts/spec.yaml` 기반, 23개 시나리오) |
| `*.test.tsx` | 단위/통합 테스트 |

## 프로젝트 구조

```
app/
  page.tsx                        # 앱 진입점
  api/
    session/route.ts              # 세션 생성
    match/join/route.ts           # 매칭 큐 참가
    match/status/route.ts         # 매칭 상태 폴링
    chat/send/route.ts            # 메시지 전송
    chat/messages/route.ts        # 메시지 폴링
    chat/end/route.ts             # 세션 종료 + 데이터 삭제
    ai-find/judge/route.ts        # AI/사람 판별 제출

components/random-chat/
  app-provider.tsx                # Context + useReducer
  app-shell.tsx                   # 헤더 + 화면 라우터
  screens/                        # 로비 / 매칭대기 / 자유채팅 / AI찾기채팅 / AI찾기결과
  shared/                         # 공유 UI 컴포넌트

lib/random-chat/
  types.ts                        # 도메인 타입
  constants.ts                    # 설정값 (폴링 간격, 매칭 타임아웃 등)
  nickname.ts                     # 닉네임 생성기
  reducer.ts                      # 상태 머신
  api-client.ts                   # 클라이언트 fetch 래퍼
  kv-schema.ts                    # Vercel KV 키 패턴
  matching.ts                     # 매칭 로직 (즉시/배치)
  glm.ts                          # GLM API 스트리밍 클라이언트

hooks/
  use-polling.ts                  # 범용 폴링 훅
  use-dark-mode.ts                # 다크모드 훅

artifacts/
  spec.yaml                       # 전체 앱 불변 계약 (23개 시나리오)
  random-chat/wireframe.html      # UI 와이어프레임
```

## Vercel 배포

```bash
vercel deploy
```

- Vercel 프로젝트 설정에서 KV 스토리지를 연결하면 `KV_REST_API_URL`, `KV_REST_API_TOKEN`이 자동 주입됩니다.
- `GLM_API_KEY`는 Vercel 대시보드 → **Settings** → **Environment Variables**에서 수동 추가합니다.
