# 프로젝트 미리보기 출처

## Unstiff

- 현재 미리보기: 사용자가 2026-11-11 제공한 공식 소개 이미지 `unstiff-project-preview.webp`.
- 파일: `public/projects/unstiff-project-preview.webp`. 1920×1080 원본을 수정 없이 복사하고, 전체 너비와 contain으로 16:9 비율을 유지한다.
- 이전 PR #56 화면 `unstiff-onboarding.png`는 이전 작업의 출처 기록으로 보존하되 현재 미리보기에서는 사용하지 않는다.
- 기본 외부 링크는 사용자 제공 App Store 앱 ID `6805492123`, GitHub는 보조 링크다.

## LocalLens

- 공식 핀 형태와 브랜드색: [favicon.svg](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/public/favicon.svg), [Logo.tsx](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/src/ui/Logo.tsx).
- 기본 미리보기: https://villagecoverage-ai.pages.dev/ 실제 사이트 iframe.
- `public/projects/locallens-introduction.svg`는 임베드가 보이지 않을 때 사용자가 선택할 수 있는 이미지 대체 화면으로 유지한다. 서비스 설명용 그래픽이며 지표나 지도 UI를 합성하지 않았다.

## HUFS 독서마라톤

- 기본 미리보기: https://readmarathon.hufs.ac.kr/ 실제 사이트 iframe.
- 기존 `public/projects/reading-marathon.png`는 이미지 대체 화면으로 보존한다.

## 임베드 대체 동작

- 기존 브라우저 프레임을 유지하며 iframe에 title과 lazy loading을 적용한다.
- cross-origin 보안 정책 차단을 onError나 타임아웃으로 단정하지 않는다. 항상 이미지 전환과 실제 사이트 새 탭 링크를 제공한다.
- 두 사이트의 응답 헤더 확인과 실제 브라우저 검증은 이번 미리보기 변경의 검증 기록에 남긴다. 보안 헤더를 수정하거나 프록시로 우회하지 않는다.

## 검증 기록 — 2026-11-11

- 대상은 최신 프로덕션 빌드를 실행한 로컬 블로그(`http://127.0.0.1:4173`)다. 운영 배포와 운영 DB 변경은 수행하지 않았다.
- LocalLens와 HUFS 독서마라톤 실제 사이트 모두 HTTP 200이며, 응답에 `X-Frame-Options`와 CSP `frame-ancestors` 제한이 없었다. Chromium 129에서 각 iframe의 실제 랜딩 페이지 본문을 확인했으며, 관련 보안 정책 차단 로그는 없었다.
- LocalLens는 1440px, HUFS 독서마라톤은 1440px·390px에서 실제 휠 입력으로 내부 스크롤 시 부모 페이지 위치가 유지됨을 확인했다. LocalLens 원본 사이트는 390px에서 `PC 화면으로 확인해 주세요` 안내를 표시한다. 이는 iframe 보안 차단과 구분하며, 원본 사이트의 모바일 제한을 임의로 수정하지 않는다.
- 두 사이트 각각 1440px·390px에서 이미지 전환, 원본 사이트 새 탭 링크, 웹사이트로 복귀가 동작하며 전환 전후 미리보기 높이가 유지됐다. LocalLens 모바일에서는 이미지 대체 화면으로 프로젝트 소개를 확인할 수 있다.
- `/projects`와 프로젝트 상세 5개를 1440px·820px·390px, light·dark 조합으로 검사했다. 총 36개 조합에서 가로 넘침과 이미지 로딩 오류가 없었다. 기존 목록 카드 5개와 Unstiff 15편·LocalLens 10편의 연결이 유지됐다.
- Unstiff WebP의 SHA-256은 사용자 제공 원본과 동일하다. 1920×1080 원본, `contain`, 전체 프레임 너비, 16:9 렌더링 비율을 확인했다. App Store URL은 HTTP 200 및 찌뿌두둥 앱 제목을 반환하며, CTA는 새 탭으로 열린다.
- `npm run lint`, `npm run typecheck`, `npm test`(프로덕션 빌드 포함, 29개 테스트), `npm run test:content`(전체 51편·기존 프로젝트 글 25편)가 통과했다. 이번 변경에 게시글 파일 수정은 없다.

브라우저 검증 재실행:

```sh
npm run build
npm run start -- --port 4173
# 별도 터미널에서 로컬 Chromium 실행 파일 경로를 지정한다.
CHROMIUM_BIN=/path/to/chromium node tests/project-previews.browser.mjs
```

검증 스크립트는 외부 요청을 차단하거나 응답·보안 헤더를 수정하지 않는다. 결과 JSON과 화면 캡처는 Git에서 제외되는 `outputs/project-preview-qa/`에 저장한다.
