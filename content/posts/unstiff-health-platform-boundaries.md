---
title: "HealthKit과 Health Connect: 같은 걸음 수를 읽는 서로 다른 경계"
description: "읽기 권한, 로컬 날짜 범위, 빈 데이터와 실패를 구분하며 iOS·Android 건강 데이터 연동을 비교했습니다."
date: "2026-11-10"
category: "Frontend"
tags: ["Unstiff","React Native","HealthKit","Health Connect","Expo"]
series: "Unstiff 개발기"
seriesOrder: 1
---

2026년 8월 Unstiff에서 오늘의 걸음 수를 읽는 초기 연동을 맡았다. iOS PR #16과 Android PR #33을 비교하며, 두 플랫폼을 같은 함수 이름 아래 묶더라도 권한의 의미까지 같아지는 것은 아니라는 점을 정리했다. **이 글은 초기 구현 기록이다. 2026-11-10 확인한 develop에는 두 모듈과 화면이 남아 있지 않다.**

## 패키지 설치와 실행 가능한 앱 사이

JS에서 건강 데이터 API를 import하는 것과 앱 바이너리에 그 API의 네이티브 구현이 포함되는 것은 별개다. Expo Go는 미리 만들어진 앱이므로 프로젝트에서 추가한 네이티브 모듈을 자유롭게 담을 수 없다. 초기 작업은 config plugin과 네이티브 의존성을 반영한 개발 빌드를 전제로 했다.

iOS에서는 HealthKit 패키지와 Nitro Modules, 권한 설명 설정을 함께 추가했다. Android에서는 Health Connect plugin과 READ_STEPS, SDK 설정을 반영했다. JS 번들만 새로 읽어도 네이티브 바이너리의 내용은 바뀌지 않는다. 다만 특정 모듈 미등록 오류나 Pod 충돌을 이 작업에서 해결했다고 말할 최종 로그는 없어 그런 오류의 해결담으로 확장하지 않는다.

## 먼저 사용 가능 여부를 확인했다

iOS API는 플랫폼 검사 뒤 `isHealthDataAvailableAsync()`를 확인했다. 지원되지 않는 환경과 실제 조회 실패를 서로 다른 오류 코드로 분리했다. Android는 `getSdkStatus()`가 사용 가능 상태인지 확인하고 `initialize()`가 성공한 뒤에만 다음 단계로 갔다. 초기화 성공은 메모리에 보관했다.

| 경계 | iOS | Android |
| --- | --- | --- |
| 읽을 종류 | HKQuantityTypeIdentifierStepCount | Steps / read |
| 권한 요청 | toRead 배열 | 이미 부여된 권한 검사 후 requestPermission |
| 집계 | cumulativeSum | aggregateRecord의 COUNT_TOTAL |
| 실패 구분 | 미지원·사용 불가·권한 요청 실패·조회 실패 | 여기에 초기화 실패 추가 |

가장 조심한 부분은 iOS 권한 요청의 반환값이다. 코드 주석에도 남겼듯 요청 완료 여부가 읽기 허용 여부를 뜻하지 않는다. 읽을 데이터가 없다는 이유만으로 사용자가 거부했다고 단정할 수 없다. Android에서는 요청 결과 배열에 Steps 읽기 권한이 실제로 있는지 다시 검사했다.

## '오늘'의 범위를 먼저 만들었다

두 구현 모두 기기 로컬 날짜의 자정부터 현재까지를 조회했다. 핵심을 줄이면 다음과 같다.

```ts
const now = new Date();
const startOfToday = new Date(now);
startOfToday.setHours(0, 0, 0, 0);
```

Android는 이 두 시각을 ISO 문자열로 바꿔 between 필터에 넣었다. ISO로 직렬화한다고 시작 시각이 UTC 자정이 되는 것은 아니다. 로컬 자정이라는 같은 순간을 UTC 표현으로 전달한다.

iOS는 cumulativeSum의 sumQuantity가 없으면 0, Android는 COUNT_TOTAL이 유한한 숫자인지 검사하고 음수는 0으로 제한했다. 조회 예외까지 0으로 바꾸지는 않았다. 정상적으로 읽었지만 데이터가 없는 경우와 읽기를 실패한 경우를 나눠야 재시도 안내를 할 수 있기 때문이다.

## 실제로 확인한 범위

#16에는 iOS 시뮬레이터의 권한 화면, 읽기 전용 요청, 데이터 없음의 0 표시, 타입 검사 통과가 기록되어 있다. iPhone의 실제 건강 앱 값과 대조한 결과는 없다. #33은 Android native build·번들링과 변경 파일 ESLint·타입 검사를 확인했지만, 에뮬레이터 환경 문제로 권한 대화상자와 실제 걸음 수 조회는 확인하지 못했다. 당시 전체 lint도 기존 Google Sign-In resolver 오류로 실패했다.

따라서 '두 OS에서 실기기 검증을 끝냈다'고 정리할 수는 없다. 읽기 전용 초기 연동과 정적 검증까지가 확인 가능한 성과다. 쓰기·백그라운드 수집도 당시 범위에 포함하지 않았다.

## 참고한 변경과 코드

- [PR #16 · iOS 초기 연동](https://github.com/swyp6/unstiff-app/pull/16)
- [HealthKit API · 당시 머지 코드](https://github.com/swyp6/unstiff-app/blob/03dea0d4f7dbbba64f67ded1d8d73ebe97249cb5/src/features/healthkit/api.ts)
- [PR #33 · Android 초기 연동](https://github.com/swyp6/unstiff-app/pull/33)
- [Health Connect API · 당시 머지 코드](https://github.com/swyp6/unstiff-app/blob/6ae90cd45c8a878044c748397b5e7aa5c7f86b8e/src/features/health-connect/api.ts)
