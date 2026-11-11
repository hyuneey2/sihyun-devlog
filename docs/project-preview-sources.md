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
