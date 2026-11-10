---
title: "읽은 알림이 다시 안 읽음으로 돌아오지 않게 하기"
description: "FCM 토큰의 계정 수명, 목록 조회와 전체 읽음의 응답 순서, cold start 랜딩을 분리했습니다."
date: "2026-11-10"
category: "Frontend"
tags: ["Unstiff","Firebase","FCM","Zustand","Race Condition"]
series: "Unstiff 개발기"
seriesOrder: 8
---

2026년 9월 알림 목록을 붙인 #82에서 시작해 #136의 읽음 동기화와 #174의 푸시 랜딩으로 이어졌다. 토큰을 등록하는 일, 알림을 읽는 일, 알림을 눌러 이동하는 일은 모두 푸시와 관련 있지만 서로 다른 상태와 검증이 필요했다.

## 토큰은 로그인 계정의 수명 안에서 등록한다

현재 useRegisterPushToken은 로그인 토큰이 있을 때 FCM 토큰을 받아 서버에 등록한다. 토큰 갱신 이벤트와 foreground 복귀에서도 재등록한다. JS가 멈춘 background 중 토큰이 바뀌었을 수 있으므로 이벤트 구독만으로 끝내지 않았다.

계정을 바꾼 뒤 이전 getFcmToken 요청이 끝날 수도 있다. effect cleanup의 cancelled는 그 결과가 새 계정의 등록 요청으로 이어지는 것을 막는다. 이미 서버로 나간 요청을 되돌리거나 모든 서버 토큰 소유권 경합을 해결하는 것은 아니다. 오류 로그도 Axios 객체 전체 대신 개발 환경에서 메시지만 남겨 디바이스·인증 토큰이 섞이지 않도록 했다.

## GET과 read-all은 순서대로 끝나지 않는다

알림 화면 진입 때 목록 조회와 전체 읽음 처리가 동시에 진행된다. 오래된 unread 목록이 늦게 도착하면 방금 읽은 항목이 다시 read:false로 보일 수 있다.

```text
목록 GET 시작: read:false인 응답을 준비
read-all 성공: 현재 목록과 dot를 읽음으로 변경
목록 GET 도착: 과거 read:false가 다시 화면을 덮음
```

#136은 목록 세대와 전체 읽음 세대를 구분했다. 목록 요청을 보낼 때 readAllGeneration을 기억하고 응답 시 현재 세대와 비교한다. 요청 중 전체 읽음이 끼어들었다면 그 응답의 항목들을 보정한다.

'한 번 전체 읽음 성공'이라는 영구 boolean은 쓰지 않았다. 그 뒤 새로 도착한 알림까지 무조건 읽음으로 만들 수 있기 때문이다. 개별 읽음을 확정한 id 집합은 따로 적용한다. 목록을 새로 불러온 뒤에는 이전 목록 세대 응답을 버려 새 페이지를 덮지 않게 한다.

cursor pagination도 같은 경계에 있다. 첫 요청에는 cursor를 억지로 0으로 넣지 않고, 받은 next cursor로 이어간다. 로딩 실패를 '알림 없음'으로 표시하지 않으며 다음 페이지 실패는 같은 cursor로 다시 시도할 수 있도록 남긴다.

## unread dot와 화면 이동은 별개다

홈은 숫자 대신 unread count가 있는지를 dot로 표시한다. 화면마다 별도 숫자를 보관하면 읽음 처리가 목록에는 반영되어도 홈에 남을 수 있어 공통 store를 사용한다. 사용자 교체 시 이전 비동기 결과가 들어오지 않게 하는 훅 경계와 상태 초기화도 함께 봐야 한다. 공통 store가 있다는 사실 자체가 계정 격리를 보장하는 것은 아니다.

#174의 랜딩은 data.type으로 결정했다. DAILY_PLAN과 DAILY_MISSION은 홈, DAILY_DISCOVERY는 채팅이며 unknown과 제거 예정 REMIND_PLAN은 no-op이다. 특정 계획 상세까지 이동하는 구현은 아니었다.

cold start에서는 기본 /home Redirect가 초기 알림 이동을 덮을 수 있어 navigation이 준비된 뒤 pending landing을 처리했다. initial/opened 경로에 같은 알림이 들어오는 경우에는 messageId로 중복 이동을 막았다. foreground 수신만으로 화면을 자동 전환하지도 않았다.

## 실제 푸시로 확인했는가

#82는 iOS 빈 목록과 dot 조건을 확인했지만 수신 데이터가 없어 개별 row 읽음을 런타임 검증하지 못했다. #136은 iOS 화면 진입의 dot 제거와 설정 왕복 경로를 확인했다. #174는 타입별 경로·중복 방지·cold start 순서를 코드로 검증한 단계이며 실제 푸시 탭은 백엔드 발송 구현 이후 실기기 확인 과제로 남아 있었다.

따라서 목록·읽음 구현과 푸시 실수신 검증을 하나의 완료 상태로 묶지 않는다. 비동기 응답 순서에 대한 보호와 플랫폼의 실제 전달 경로는 별도로 확인해야 한다.

## 참고한 변경과 코드

- [PR #82 · 알림 목록](https://github.com/swyp6/unstiff-app/pull/82)
- [PR #136 · 읽음 세대 동기화](https://github.com/swyp6/unstiff-app/pull/136)
- [PR #174 · 타입별 랜딩](https://github.com/swyp6/unstiff-app/pull/174)
- [목록·cursor·read-all 코드](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/app/notifications.tsx)
- [FCM 토큰 등록 수명](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/features/notifications/use-register-push-token.ts)
- [cold start 랜딩 훅](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/features/notifications/use-notification-landing.ts)
