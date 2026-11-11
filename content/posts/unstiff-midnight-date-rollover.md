---
title: "자정이 지나도 오늘의 미션이 어제에 머물렀던 이유"
description: "KST 서버 날짜와 로컬 캘린더 날짜를 분리하고, 타이머·foreground 복귀·늦은 응답까지 함께 처리했습니다."
date: "2026-11-10"
category: "Frontend"
tags: ["Unstiff", "React Native", "Date", "Timezone", "AppState"]
series: "Unstiff 개발기"
seriesOrder: 11
---

2026년 10월 PR #239는 앱을 켜 둔 채 자정을 넘겨도 오늘의 미션이 전날 것으로 남는 문제를 고쳤다. #65의 캘린더 API 연동 이후 날짜에 의존하는 화면이 늘었지만, 시간이 흐른다는 사실 자체는 React의 상태 변경 신호가 아니었다.

## Date를 읽는 것만으로는 다시 조회하지 않는다

마운트 때 오늘을 만들고 effect를 한 번 실행하면, 화면이 계속 마운트된 동안에는 다음 날이 되어도 effect가 저절로 실행되지 않는다. 화면에 날짜를 그릴 수 있다는 것과 날짜 경계를 구독하는 것은 별개다.

미션 API에는 날짜 인자가 없고 서버가 Asia/Seoul 기준 오늘을 결정한다. 기기 로컬 날짜만 사용하면 해외 시간대에서 서버의 날짜 변경과 맞지 않는다. 반면 캘린더는 로컬 날짜로 표시하므로 미션 기준으로 모두 바꾸면 기존 UX를 바꾸게 된다.

```text
미션: 서버 KST 날짜 key → 오늘 미션 조회
캘린더: 로컬 날짜 key → 기존에 오늘을 보던 경우만 선택 이동
```

## 날짜를 재조회 신호로 만들었다

use-current-date-key는 YYYY-MM-DD 문자열을 상태로 보관한다. KST는 고정 UTC+9를 더한 시각을 UTC 날짜로 읽는다.

```ts
const SERVER_UTC_OFFSET_MS = 9 * 60 * 60 * 1000;
return new Date(Date.now() + SERVER_UTC_OFFSET_MS).toISOString().slice(0, 10);
```

다음 자정까지 timer를 걸고, 실행 후 다시 다음 자정을 예약한다. background에서 JS timer가 제때 실행된다고 가정하지 않고 AppState active에서도 실제 날짜를 다시 읽는다. 같은 날이면 문자열이 같아 날짜 의존 effect의 불필요한 재실행을 줄인다. listener와 timer는 cleanup에서 해제한다.

이 구현은 서버와 기기의 시계가 정확히 동기화되었다는 보장은 아니다. KST 오프셋과 기기 시계로 서버 날짜를 근사하는 클라이언트 정책이다.

## 요청 시작 시각보다 응답의 missionDate가 중요했다

자정 직전 요청이 새벽에 도착할 수 있다. 날짜 key만 바꿔 새 요청을 보내더라도 이전 응답이 늦게 와서 전날 미션을 덮으면 같은 문제가 반복된다. applyMissionResponse는 응답의 missionDate가 현재 서버 날짜 key와 같을 때만 반영한다.

날짜가 바뀐 첫 렌더부터 이전 missionId와 CTA 상태도 비운다. 새 응답 전까지 전날 미션에 수락·닫기·기록 요청을 보내지 않기 위해서다. 기기가 약간 빨라 서버가 아직 이전 날짜를 반환한 경우는 2초 뒤 한 번만 재조회하고, 실패 날짜를 기억해 foreground 복귀에서도 재시도한다. 일반 네트워크 실패에 무한 polling을 붙인 것은 아니다.

캘린더는 직전 로컬 오늘을 선택 중일 때만 새 오늘로 옮긴다. 과거 기록을 보고 있었다면 사용자의 선택을 유지한다.

## 자정 테스트를 실제 기기에서 돌렸는가

#239는 foreground 자정 통과, background 복귀, 과거 날짜 선택 유지, 같은 날 복귀 시나리오의 코드 흐름을 확인했다. 실제 자정 시나리오를 시뮬레이터·에뮬레이터로 실행하지는 않았다. 변경 파일 ESLint는 통과했으나 전체 lint와 타입 검사는 기존 의존성 문제로 실패한 상태였다.

그래서 이 글은 실제 자정 실기기 QA 완료 사례가 아니다. 장시간 유지되는 화면에서 날짜를 상태의 의존성으로 만들고, 변경 시점의 데이터와 늦은 응답까지 함께 무효화한 구현 기록이다.

## 참고한 변경과 코드

- [PR #65 · 캘린더 API](https://github.com/swyp6/unstiff-app/pull/65)
- [PR #239 · 날짜 rollover와 검증 한계](https://github.com/swyp6/unstiff-app/pull/239)
- [날짜 key 훅](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/hooks/use-current-date-key.ts)
- [미션 응답·캘린더 선택 처리](<https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/app/(tabs)/home.tsx>)
