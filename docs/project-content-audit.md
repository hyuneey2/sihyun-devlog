# 프로젝트·게시글 조사 기록

조사일: 2026-11-10 (Asia/Seoul). 발행 날짜와 개발 당시 날짜를 구분한다.

## Git 및 기존 변경

- 저장소: `hyuneey2/sihyun-devlog`, 시작 브랜치 `main`.
- 최신 원격 main 기준: `1a72f87840196114fe85f7ebd7128355e35d932b`.
- 단일 작업 브랜치: `feat/add-swyp-ailife-projects-and-posts`. 작업 단위별 커밋·푸시, PR 생성·병합·운영 배포·운영 DB 쓰기 금지.
- 시작 전에 존재한 `package-lock.json` 변경(136줄 추가, 13줄 삭제)은 사용자 변경으로 보존하고 커밋에서 제외한다.

## 기존 블로그 구조

- `lib/projects.ts`: Dailog, HUFS 독서마라톤, withChurch 3개. 배열 순서를 유지하면서 최신 프로젝트를 앞에 추가한다.
- `app/projects/[slug]/page.tsx`: image/live preview, 프로젝트 정보, 태그 기반 관련 글.
- `lib/project-posts.ts`: 기본 3개 제한 때문에 withChurch의 네 번째 글도 숨겨진다. 프로젝트 상세에서는 관련 글 전체를 제공한다.
- `content/posts/*.md` → `lib/posts.ts`의 Vite raw glob → Markdown 렌더링.
- `lib/post-data.ts`: D1 binding이 없으면 bundled posts, 있으면 D1 사용. `initial_markdown_seed_v2`가 있으면 초기화를 건너뛰므로 새 Markdown이 누락된다.
- 시리즈는 `series` + `seriesOrder`, 카테고리는 Frontend/Backend/Algorithm. 신규 글은 Frontend이며 Unstiff/LocalLens 태그와 별도 시리즈를 사용한다.
- 증분 등록은 기존 slug/id/시리즈 순서 소유자를 보호하고, 한 번 등록된 글을 관리자 삭제 이후 다시 만들지 않도록 이력을 남겨야 한다. 관리자 수정과 상태·작성자·날짜를 덮어쓰지 않는다.

## 기존 글과 중복 판단

기존 글 전체 목록과 파일별 주제는 [기존 콘텐츠 목록](./existing-content-audit.md)에 기록한다. 알고리즘 7편, Node.js 학습 기록 및 9편 시리즈, React/웹/API 기초, 기존 프로젝트 경험을 유지한다.

- withChurch 4편: 쿠키 CORS, JWT 역할 확인, 회원가입 role 누락, 조회 API 개선. Unstiff의 네이티브·동의·비동기 저장 문제와 직접 중복되지 않는다.
- 독서마라톤: 단독 프론트엔드 구조, 빌드/프록시/협업. 이번에는 일반적인 React/API 입문 설명을 반복하지 않고 플랫폼 경계와 실제 PR 변경을 다룬다.
- Dailog 반복 일정: 서버 관계 모델. 운동 기록의 refId는 클라이언트 식별 문제이므로 별개지만 카메라·기록 글에 통합한다.

## 조사 기준과 사실 경계

- Unstiff develop: [`265c574`](https://github.com/swyp6/unstiff-app/tree/265c574ad0762df0489ae550c9c9ef6803db2b1a). LocalLens main: [`aef02eb`](https://github.com/ai-life-challenge/ai-life-FE/tree/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25). PR은 아래 머지 이력과 diff를 확인했다.
- 조회한 모든 PR 작성자는 `hyuneey2`. 팀 전체 기능을 단독 성과로 표현하지 않으며 팀 인원수·기여율은 만들지 않는다.
- Unstiff 주요 확인 활동은 2026-08-27~10-05, LocalLens는 2026-10~11월이다. 프로젝트 진행/출시 완료 여부를 추정하지 않는다.
- HealthKit·Health Connect 및 local KakaoMap 모듈은 초기 PR에는 있으나 현재 develop 트리에 없다. 과거 merge commit을 코드 링크로 사용한다. 현재 배포 앱 기능이라고 표현하지 않는다.
- HealthKit PR #16은 시뮬레이터 권한/빈 데이터 확인이며 iPhone 데이터 비교 미완료. Health Connect #33은 native build/정적 검사만 확인, Android 실기기 권한·조회 미완료.
- LocalLens는 서버 지원 72곳, 공개 정적 자료 59곳, 미지원 13곳. 정적 자료는 백엔드 장애 대응이며 인터넷 전체 오프라인/PWA가 아니다.
- 서버 CP-SAT와 브라우저 결정적 근사를 구분한다. 자료 출처와 계산 출처도 별도다. AI 질문 실패 시 자료 조회는 AI가 아니다.
- `docs/estimated-simulation.md` 2절의 “스냅샷이 없다”는 오래된 문구다. 같은 문서 6절·현재 README·offline-snapshot·PR #17의 공개 59곳이 최신 근거다.
- 574 pass/2 skip 및 브라우저 111개는 2026-11-07 로컬 Cloudflare 런타임 검증 기록이다. 이번 블로그 검사 결과나 실제 CDN 배포 검증으로 쓰지 않는다.

## 후보별 발행·통합·제외 결정

| 후보 | 결정 및 근거 |
| --- | --- |
| SWYP-01 네이티브 빌드 오류 | Expo Go/개발 바이너리 경계는 HealthKit·Kakao 글에 통합. RNGoogleSignin/NativeRNFBTurboApp/ExpoModulesJSI/Pod 충돌·코드 서명의 최종 해결 로그가 없어 독립 성공담 제외 |
| SWYP-02 건강 데이터 | #16/#33 비교 글. 읽기 권한, 로컬 날짜, 빈 데이터와 거부의 차이, 검증 한계 |
| SWYP-03 Kakao Native SDK | #10 iOS 초기 구현. props/뷰 생명주기/Config Plugin 및 현재 제거 상태 |
| SWYP-04 온보딩 | #56/#71/#114/#120. 임시 UI 상태와 서버 상태, 재진입·제출·가드 |
| SWYP-05 약관 분리 | #41/#114/#120/#165. 최초 Eleventy 정적 사이트와 팀 static 이전, WebView·URL 계약 |
| SWYP-06 카메라·기록 | #80/#106/#190/#229. 촬영/업로드/저장/식별 통합, 실제 완료 후 중복 POST 근거를 확인해 경쟁 상태 별도 분리 여부 결정 |
| SWYP-07 기록 입력 | #219/#227/#233. 서버 DTO 경계·UI 단위·공통 컴포넌트와 picker |
| SWYP-08 푸시 | #82/#136/#174. 토큰/읽음/계정별 stale 상태/landing, 실제 테스트만 기재 |
| SWYP-09 BottomSheet | #180/#184/#186/#196/#198/#204. 키보드·inset·스크롤·가상화 생명주기 통합 |
| SWYP-10 Photo Picker | #202. 최종 manifest·권한 최소화. 당시 대응과 현행 정책을 구분 |
| SWYP-11 자정 | #65/#239. 서버 KST 날짜와 로컬 캘린더 날짜, 늦은 응답·복귀 |
| SWYP-12 AI 동의·채팅 | #127/#131. 동의·전송 상태·재시도·남은 경쟁 상태 구분 |
| 추가: 스톱워치 | #176/#207. 누적 구간·재개·확인 모달·중복 종료를 묶어 발행 |
| 추가: Analytics | #224. 사용자 식별 lifecycle과 실패 격리, 의미 있는 범위로 발행 |
| 추가: Figma 토큰 | 저장소 sync 스크립트·token-export 문서 확인. 실제 값 변환과 운영 제약이 충분하면 발행 |
| 추가: TestFlight/코드 서명 | 재현 로그·최종 해결 근거 없어 제외 |
| 추가: 시스템 카메라/OS UI | 각각 카메라·BottomSheet 글에 통합 |
| 추가: 공통 오류 모달/Remote Config | 논의와 구현 근거 구분. 확인되지 않은 완료 주장 제외 |
| LocalLens-01 데이터·지도 | README/data-audit/judge/hooks/MapView. 지표와 프론트 표현의 책임 |
| LocalLens-02 설명 일관성 | #10/#13/#14. 계산 단위·시설·나이대·범례·출처 |
| LocalLens-03 예산/What-if | store/WhatIf, #13/#15. 입력 기준과 실험값, k 식별자 |
| LocalLens-04 브라우저 추정 | #15/estimatePlans/fallback. 결정적 근사·상한·오차와 비교 조건 |
| LocalLens-05 Snapshot | #16/#17/snapshot/store. manifest·두 파일·hash·4초 유예·복구·59/13 |
| LocalLens-06 이용 조건 | #17/data-licenses. OSM 값 분리·공개 생성 중단 조건, 법적 판단 미확정 |
| LocalLens-07 테스트 | public-snapshot/snapshot-all/store/compare 테스트. 과거 결과와 미검증 영역 명시 |
| LocalLens-08 보고서 | Report/autosave/reportSaver/RichText. 서버 수락·로컬 초안·저장 경합·PDF |
| 추가: 리브랜딩/정보 페이지 | #11/#12/#14, 별도 글 대신 프로젝트·데이터 기준 글에 통합 |
| 추가: 공유 링크 | #13/share.ts 및 테스트. 범위 검증·복원 시점이 충분해 별도 발행 |
| 추가: 지도 비동기 | 데이터·What-if·fallback 글에 통합 |
| 추가: 로컬 자료 조회 | localAnswer/ChatDock 및 #16. 생성형 AI와 구분해 별도 발행 |

## PR 근거 목록

| 프로젝트 | PR | 변경 | 작성자 | 머지일(UTC) |
| --- | --- | --- | --- | --- |
| Unstiff | [#10](https://github.com/swyp6/unstiff-app/pull/10) | [Feature] 카카오맵 iOS 초기 연동 | hyuneey2 | 2026-08-27 |
| Unstiff | [#16](https://github.com/swyp6/unstiff-app/pull/16) | [Feat] iOS HealthKit 걸음 수 조회 연동 | hyuneey2 | 2026-08-28 |
| Unstiff | [#33](https://github.com/swyp6/unstiff-app/pull/33) | [Feature] Android Health Connect 걸음 수 연동 | hyuneey2 | 2026-08-31 |
| Unstiff | [#41](https://github.com/swyp6/unstiff-app/pull/41) | [Feat] 약관 웹페이지 호스팅 및 앱 연동 | hyuneey2 | 2026-09-03 |
| Unstiff | [#56](https://github.com/swyp6/unstiff-app/pull/56) | [Feature] 회원가입 온보딩 및 프로필 설정 플로우 구현 | hyuneey2 | 2026-09-06 |
| Unstiff | [#65](https://github.com/swyp6/unstiff-app/pull/65) | [Feature] 홈 캘린더 API 연동 | hyuneey2 | 2026-09-06 |
| Unstiff | [#71](https://github.com/swyp6/unstiff-app/pull/71) | [Feature] 유저 프로필 조회 저장 및 회원 탈퇴 API 연동 | hyuneey2 | 2026-09-07 |
| Unstiff | [#80](https://github.com/swyp6/unstiff-app/pull/80) | [Feature] 운동 기록 및 카메라 기록 플로우 연동 | hyuneey2 | 2026-09-10 |
| Unstiff | [#82](https://github.com/swyp6/unstiff-app/pull/82) | [Feature] 알림 목록 및 읽음 상태 연동 | hyuneey2 | 2026-09-08 |
| Unstiff | [#106](https://github.com/swyp6/unstiff-app/pull/106) | [Fix] 미션 운동 기록 및 신규 기록 저장 API 수정 | hyuneey2 | 2026-09-12 |
| Unstiff | [#114](https://github.com/swyp6/unstiff-app/pull/114) | [Feature] 약관 관리 구조 및 온보딩 동의 항목 정리 | hyuneey2 | 2026-09-14 |
| Unstiff | [#120](https://github.com/swyp6/unstiff-app/pull/120) | [Feature] 온보딩 약관 WebView 통일 및 재진입 가드 추가 | hyuneey2 | 2026-09-14 |
| Unstiff | [#127](https://github.com/swyp6/unstiff-app/pull/127) | [Feature] 외부 AI 동의 기반 채팅 진입 플로우 구현 | hyuneey2 | 2026-09-15 |
| Unstiff | [#131](https://github.com/swyp6/unstiff-app/pull/131) | [Fix] 채팅 UI 및 대화 상태 처리 개선 | hyuneey2 | 2026-09-15 |
| Unstiff | [#136](https://github.com/swyp6/unstiff-app/pull/136) | [Fix] 알림 읽음 처리 및 알림 설정 네비게이션 오류 수정 | hyuneey2 | 2026-09-16 |
| Unstiff | [#165](https://github.com/swyp6/unstiff-app/pull/165) | [Fix] 약관 URL 최신화 및 개인정보 처리방침·고객 지원 연결 | hyuneey2 | 2026-09-19 |
| Unstiff | [#174](https://github.com/swyp6/unstiff-app/pull/174) | [Feat] 푸시 알림 타입별 랜딩 처리 | hyuneey2 | 2026-09-20 |
| Unstiff | [#176](https://github.com/swyp6/unstiff-app/pull/176) | [Fix] 스톱워치 재개 시 시간 표시 오류 수정 | hyuneey2 | 2026-09-20 |
| Unstiff | [#180](https://github.com/swyp6/unstiff-app/pull/180) | [Fix] 바텀시트 하단 CTA 스크롤 접근성 수정 | hyuneey2 | 2026-09-20 |
| Unstiff | [#184](https://github.com/swyp6/unstiff-app/pull/184) | [Fix] Android 운동 완료 CTA 하단 여백 보정 | hyuneey2 | 2026-09-20 |
| Unstiff | [#186](https://github.com/swyp6/unstiff-app/pull/186) | [Fix] 키보드 활성화 시 운동 바텀시트 최대 높이로 확장 | hyuneey2 | 2026-09-20 |
| Unstiff | [#190](https://github.com/swyp6/unstiff-app/pull/190) | [Fix] 운동 기록 상세 조회 refId 기반 매칭 | hyuneey2 | 2026-09-20 |
| Unstiff | [#196](https://github.com/swyp6/unstiff-app/pull/196) | [Fix] 신고 바텀시트 키보드 활성화 시 레이아웃 잘림 수정 | hyuneey2 | 2026-09-20 |
| Unstiff | [#198](https://github.com/swyp6/unstiff-app/pull/198) | [Fix] 채팅 신고 시트 생명주기 및 상태바 가독성 개선 | hyuneey2 | 2026-09-20 |
| Unstiff | [#202](https://github.com/swyp6/unstiff-app/pull/202) | [Fix] Android 불필요 미디어 권한 제거 및 시스템 Photo Picker 적용 | hyuneey2 | 2026-09-20 |
| Unstiff | [#204](https://github.com/swyp6/unstiff-app/pull/204) | [Fix] Android 운동 기록 BottomSheet 하단 CTA 노출 수정 | hyuneey2 | 2026-09-20 |
| Unstiff | [#207](https://github.com/swyp6/unstiff-app/pull/207) | [Feat] 스톱워치 완료 플로우 개선 | hyuneey2 | 2026-09-26 |
| Unstiff | [#219](https://github.com/swyp6/unstiff-app/pull/219) | [Fix] 운동 기록 입력값 범위 제한 및 picker 렌더링 오류 수정 | hyuneey2 | 2026-09-29 |
| Unstiff | [#224](https://github.com/swyp6/unstiff-app/pull/224) | [Feature] GA 사용자 ID 연동 | hyuneey2 | 2026-09-30 |
| Unstiff | [#227](https://github.com/swyp6/unstiff-app/pull/227) | [Feature] 운동 기록 수정 항목 추가 및 바텀시트 스크롤 개선 | hyuneey2 | 2026-10-01 |
| Unstiff | [#229](https://github.com/swyp6/unstiff-app/pull/229) | [feature] 시스템 카메라 촬영 플로우로 변경 | hyuneey2 | 2026-10-02 |
| Unstiff | [#233](https://github.com/swyp6/unstiff-app/pull/233) | [Feature] 오늘의 운동 목표값 직접 입력 기능 추가 | hyuneey2 | 2026-10-02 |
| Unstiff | [#239](https://github.com/swyp6/unstiff-app/pull/239) | [Fix] 자정 이후 오늘의 미션이 전날 기준으로 유지되는 문제 수정 | hyuneey2 | 2026-10-05 |
| LocalLens | [#10](https://github.com/ai-life-challenge/ai-life-FE/pull/10) | fix: 의료 접근성 진단 및 결과 표시 오류 수정 | hyuneey2 | 2026-10-26 |
| LocalLens | [#11](https://github.com/ai-life-challenge/ai-life-FE/pull/11) | feat: LocalLens 리브랜딩 및 파비콘 적용 | hyuneey2 | 2026-10-26 |
| LocalLens | [#12](https://github.com/ai-life-challenge/ai-life-FE/pull/12) | feat: 푸터 리디자인 및 프로젝트 정보 페이지 추가 | hyuneey2 | 2026-10-26 |
| LocalLens | [#13](https://github.com/ai-life-challenge/ai-life-FE/pull/13) | fix: 진단 판정 및 결과 표시 일관성 개선 | hyuneey2 | 2026-10-27 |
| LocalLens | [#14](https://github.com/ai-life-challenge/ai-life-FE/pull/14) | feat: 공공데이터 활용 안내 및 분석 기준 연결 개선 | hyuneey2 | 2026-10-27 |
| LocalLens | [#15](https://github.com/ai-life-challenge/ai-life-FE/pull/15) | feat: 서버 장애 대응 추정 시뮬레이션 및 지도 안정성 개선 | hyuneey2 | 2026-11-05 |
| LocalLens | [#16](https://github.com/ai-life-challenge/ai-life-FE/pull/16) | 백엔드 전체 장애 대응: 72개 지역 정적 자료 기반 독립 시뮬레이션 (자료 공개는 승인 대기) | hyuneey2 | 2026-11-06 |
| LocalLens | [#17](https://github.com/ai-life-challenge/ai-life-FE/pull/17) | feat: 59개 지역 정적 자료 공개와 OSM 파생값 ODbL 분리 | hyuneey2 | 2026-11-07 |

## 시작 상태 검사

- ESLint 통과.
- `node_modules/.bin/vinext build` 통과.
- TypeScript 기존 오류 6개: admin route nullable input 2곳, posts category narrowing 1곳, Cloudflare runtime types 3곳.
- `npm run build`는 로컬 macOS에 GNU timeout이 없어 그대로 실행할 수 없는 상태. 최종 검증에서 이식 가능한 실행 경로를 정리한다.
- 브라우저·D1 검증은 구현 후 수행한다. 운영 API/DB 쓰기 없이 로컬 fixture로 검사한다.
