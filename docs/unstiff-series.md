# Unstiff 개발기

2026-11-10 발행. 개발 당시 시점과 현재 코드의 차이, 실제 테스트의 한계를 각 글 본문에 남겼다. 각 글 하단에 PR과 고정 commit의 코드 링크가 있다.

| 순서 | 글 | slug |
| --- | --- | --- |
| 1 | [HealthKit과 Health Connect: 같은 걸음 수를 읽는 서로 다른 경계](../content/posts/unstiff-health-platform-boundaries.md) | `unstiff-health-platform-boundaries` |
| 2 | [KakaoMapsSDK를 로컬 Expo Module로 연결하며 나눈 책임](../content/posts/unstiff-kakao-local-expo-module.md) | `unstiff-kakao-local-expo-module` |
| 3 | [온보딩 상태를 초기화했더니 로그인 화면으로 돌아갔다](../content/posts/unstiff-onboarding-state-and-guards.md) | `unstiff-onboarding-state-and-guards` |
| 4 | [앱 안의 약관을 정적 사이트로 분리하고 URL 계약을 다시 맞췄다](../content/posts/unstiff-legal-static-assets-and-webview.md) | `unstiff-legal-static-assets-and-webview` |
| 5 | [촬영부터 운동 기록 완료까지, 비동기 작업의 경계를 나누기](../content/posts/unstiff-camera-to-workout-record.md) | `unstiff-camera-to-workout-record` |
| 6 | [router.replace 뒤에 잠금을 풀면 운동 기록이 두 번 저장될 수 있다](../content/posts/unstiff-submit-lock-after-navigation.md) | `unstiff-submit-lock-after-navigation` |
| 7 | [운동 기록 입력을 서버 DTO와 맞추며 발견한 경계값 문제](../content/posts/unstiff-measure-validation-and-picker.md) | `unstiff-measure-validation-and-picker` |
| 8 | [읽은 알림이 다시 안 읽음으로 돌아오지 않게 하기](../content/posts/unstiff-push-read-state-and-landing.md) | `unstiff-push-read-state-and-landing` |
| 9 | [BottomSheet가 가려질 때 높이·inset·소유권을 나눠 봤다](../content/posts/unstiff-bottom-sheet-layout-lifecycle.md) | `unstiff-bottom-sheet-layout-lifecycle` |
| 10 | [Photo Picker로 바꾸고도 최종 Manifest를 확인한 이유](../content/posts/unstiff-android-photo-picker-permissions.md) | `unstiff-android-photo-picker-permissions` |
| 11 | [자정이 지나도 오늘의 미션이 어제에 머물렀던 이유](../content/posts/unstiff-midnight-date-rollover.md) | `unstiff-midnight-date-rollover` |
| 12 | [AI 동의와 채팅 요청을 하나의 세대로 관리하기](../content/posts/unstiff-chat-consent-and-request-generation.md) | `unstiff-chat-consent-and-request-generation` |
| 13 | [스톱워치 재개와 종료 확인을 toggle 하나로 처리하지 않기](../content/posts/unstiff-stopwatch-segments-and-confirmation.md) | `unstiff-stopwatch-segments-and-confirmation` |
| 14 | [Analytics 사용자 식별을 로그인 이벤트보다 먼저 연결하기](../content/posts/unstiff-analytics-user-lifecycle.md) | `unstiff-analytics-user-lifecycle` |
| 15 | [Figma Variables를 앱 토큰으로 옮길 때 값보다 먼저 정한 것](../content/posts/unstiff-figma-token-sync-boundaries.md) | `unstiff-figma-token-sync-boundaries` |

네이티브 빌드 원리는 초기 연동 두 편에 통합했다. 해결 로그가 없는 모듈 미등록·Pod 충돌·코드 서명, 구현 완료 근거가 없는 Remote Config·공통 오류 설계는 별도 성공담으로 발행하지 않았다. 촬영 경험과 refId는 기록 플로우에, OS 상태바 차이는 BottomSheet에 통합했다.
