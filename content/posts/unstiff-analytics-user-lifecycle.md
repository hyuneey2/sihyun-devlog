---
title: "Analytics 사용자 식별을 로그인 이벤트보다 먼저 연결하기"
description: "수동·자동 로그인과 로그아웃의 사용자 ID 수명을 맞추고, 분석 실패가 인증을 막지 않게 분리했습니다."
date: "2026-11-10"
category: "Frontend"
tags: ["Unstiff","Firebase Analytics","Authentication","Async"]
series: "Unstiff 개발기"
seriesOrder: 14
---

2026년 9월 PR #224는 이벤트를 더 많이 수집하는 작업이 아니라, 기존 이벤트가 어느 로그인 사용자에 속하는지를 연결하는 변경이었다. 로그인 버튼에서 login을 보냈다는 사실만으로 서버 user ID가 분석 이벤트와 연결되는 것은 아니었다.

## 이벤트 payload와 세션 식별은 다른 책임이다

공통 Analytics helper에 setAnalyticsUserId를 추가해 Firebase의 setUserId를 호출했다. 이벤트마다 user_id 필드를 수동으로 끼워 넣는 대신, 로그인 세션이 시작할 때 식별을 설정하고 이후 전송되는 이벤트에 연결하도록 했다.

여기서는 이메일이나 토큰을 식별자로 쓰지 않고 서버 UserProfile.id를 사용했다. 실제 식별자나 계정 정보는 예제에 싣지 않는다.

```text
소셜 로그인 성공
→ 서버 프로필 ID 조회
→ Analytics user ID 설정
→ 기존 login / sign_up 이벤트
```

순서가 바뀌면 login 이벤트는 식별이 설정되기 전에 전송될 수 있다. 이벤트 이름을 바꾸거나 호출부 전체를 수정하지 않고 인증 경계의 순서를 조정한 이유다.

## 버튼을 누르지 않는 로그인도 있다

저장된 토큰으로 앱을 다시 여는 사용자는 소셜 로그인 버튼을 거치지 않는다. 버튼 안에만 식별 설정이 있으면 자동 로그인 이후의 이벤트는 연결되지 않는다. tabs 진입의 기존 프로필 조회 결과를 재사용해 이 경로도 설정했다.

반대 방향도 필요하다. 로그아웃과 회원 탈퇴 때 null로 초기화하지 않으면, 같은 기기에서 다른 사용자가 로그인하기 전의 이벤트가 이전 사용자에 연결될 수 있다. 식별의 수명을 '앱 설치'나 '프로필 화면'이 아니라 로그인 세션에 맞췄다.

## 분석 실패가 인증 실패가 되어서는 안 된다

Analytics 설정은 로그인·라우팅의 필수 조건이 아니다. #224는 ID 설정이 실패하더라도 인증 결과와 화면 이동을 계속하도록 격리했다. 다만 '식별 후 이벤트 전송'이라는 의도와 오류를 무시한 경우의 실제 수집 결과는 구분해야 한다.

현재 helper는 Firebase Promise를 반환한다. 어느 호출자가 await하고 어느 경계에서 catch하는지가 순서와 실패 영향을 결정한다. 공통 함수에 넣었다는 이유만으로 모든 이벤트가 서버에서 정확히 연결되었다고 단정할 수 없다.

검토할 경우는 신규 로그인, 기존 로그인, 자동 로그인, 로그아웃 후 다른 계정, 분석 SDK 실패다. 이 목록은 코드 경로를 나눠 확인하기 위한 기준이며, 전부 기기에서 실행한 결과 목록은 아니다.

## 확인한 범위

#224의 lint는 오류 없이 기존 Axios 경고 5건, 타입 검사와 diff 검사는 통과했다. 하지만 iOS/Android 런타임과 GA DebugView의 실제 user ID 연결은 미확인으로 남아 있다. 따라서 분석 대시보드에서 사용자별 이벤트가 정상 수집되었다는 결과는 쓰지 않는다.

이 작업에서 확인 가능한 것은 ID 설정·이벤트의 호출 순서와 세션 종료 시 초기화 경로다. 분석 기능도 화면 밖에 있다는 이유로 상태의 수명을 생략할 수 없다는 점을 남긴다.

## 참고한 변경과 코드

- [PR #224 · 사용자 ID 연결과 검증 범위](https://github.com/swyp6/unstiff-app/pull/224)
- [Analytics helper](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/features/analytics/analytics.ts)
- [로그인 이벤트 호출 순서](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/features/auth/components/social-login-buttons.tsx)
- [로그아웃 초기화](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/features/auth/logout.ts)
