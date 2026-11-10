---
title: "운동 기록 입력을 서버 DTO와 맞추며 발견한 경계값 문제"
description: "분·km 입력과 초·m DTO, 생성·수정 범위, Picker 재진입의 가상화 문제를 함께 정리했습니다."
date: "2026-11-10"
category: "Frontend"
tags: ["Unstiff","Validation","TypeScript","React Native","FlatList"]
series: "Unstiff 개발기"
seriesOrder: 7
---

2026년 9~10월 #219, #227, #233에서 운동 기록의 시간·거리·횟수·세트 입력을 정리했다. 숫자 입력 UI가 정상으로 보여도 서버 스키마를 넘는 값이 전송될 수 있었다. 생성과 수정 화면이 같은 의미의 값을 다르게 다루는 것도 문제였다.

## 화면의 단위와 API의 단위가 다르다

화면은 시간에 분, 거리에 km를 쓰고 API는 초와 m를 쓴다. 현재 actual-measure의 서버 경계는 duration 1~36059초, distance 100~99900m, count 1~9999회, sets 1~99세트다. 모든 값은 정수여야 한다.

```text
선택한 항목 + 화면 값(분/km)
→ toActualMeasuresDto
→ 변환된 정수 DTO의 범위 검사
→ POST 또는 PUT
```

입력하지 않은 항목은 0을 보내는 대신 필드를 만들지 않는다. 0은 '측정하지 않음'과 '측정 결과가 0'을 혼동시키고 최소 범위를 위반할 수 있다. 항목을 모두 끌 수는 있지만 저장 버튼에서는 최소 하나를 요구한다.

## 최대값을 clamp해도 유효하다는 보장은 없다

거리 step은 0.1km다. 최대를 99.99로 잡으면 99.9에서 증가 시 99.99로 clamp한 뒤 toFixed(1)이 100.0을 만들 수 있다. API 최대 99900m를 넘는다. 그래서 화면 최대도 step과 맞는 99.9로 정했다.

시간도 서버 최대와 UI 최대를 무조건 같게 만들지 않았다. 분 단위 picker의 최대는 표현 가능한 유효값인 600분, 즉 10:00이다. 10시간을 고르면 분은 00만 허용한다.

횟수는 생성/연결 기록의 기존 UI 최대 50을 유지했고 수정 직접 입력은 9999까지 허용했다. 이것을 모든 화면이 같은 최대값을 가진다고 요약하면 실제 UX를 잘못 설명하게 된다.

## 키보드 제한보다 DTO 검증이 마지막 경계다

number-pad를 써도 붙여넣기나 코드 경로로 소수·음수·문자가 들어올 수 있다. 수정 화면에서는 유효하지 않은 값을 강제로 그럴듯한 값으로 바꾸는 대신 확인 버튼을 비활성화했다. 최종 저장 전에는 변환된 DTO를 다시 검사한다.

실제 검증 함수의 핵심은 다음 조건이다.

```ts
if (value == null) return true; // 선택하지 않은 항목
return Number.isInteger(value)
  && value >= minimum
  && value <= maximum;
```

UI의 + 버튼과 picker 범위는 사용자의 실수를 줄이고, DTO 검증은 다른 진입 경로까지 보호한다. 둘 중 하나를 없애는 문제가 아니다.

## 재사용하면서 정책은 주입했다

#227은 기본값·항목 토글·measure key 매핑과 50자 memo 필드를 생성/수정에서 공유했다. #233은 MeasureValueBottomSheet에 ACTUAL_MEASURE_CONFIG와 GOAL_CONFIG를 각각 전달해 실제 수행값과 계획 목표값의 정책을 분리했다. 같은 모양의 컴포넌트라고 같은 최소값·최대값을 써야 하는 것은 아니다.

시트를 다시 열 때 저장하지 않은 임시값이 남지 않도록 기존 기록 기준으로 초기화했다. 저장과 취소가 같은 상태를 남기면 수정 화면이 실제 서버 값과 어긋나기 때문이다.

## 09:59 재진입에서 분이 사라진 이유

#219에는 큰 index로 시간 picker에 다시 들어갈 때 일부 분이 렌더되지 않는 문제가 있었다. non-loop PickerColumn의 초기 위치를 initialScrollIndex로 잡아 필요한 항목을 초기 가상화 범위에 포함시켰다. 스크롤 위치만 이동시키는 것과 그 위치의 항목이 이미 렌더되어 있는 것은 다른 조건이다.

당시 iPhone 17 시뮬레이터에서 09:30·09:59·10:00 저장/재진입, 10:00에서 감소 후 09:59 재진입, 최대값 + 차단과 DTO 경계를 확인했다. #227은 iOS 실기기 수정·스크롤을 확인했다. #233은 정적 검증 기록이며 직접 입력 picker의 실기기 재확인은 남아 있었다.

## 참고한 변경과 코드

- [PR #219 · DTO 경계와 picker](https://github.com/swyp6/unstiff-app/pull/219)
- [PR #227 · 수정 화면 재사용](https://github.com/swyp6/unstiff-app/pull/227)
- [PR #233 · 목표 직접 입력](https://github.com/swyp6/unstiff-app/pull/233)
- [단위·범위·항목 정책](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/features/workout-record/actual-measure.ts)
- [공용 시간 Picker](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/features/workout-plan/components/time-picker-bottom-sheet.tsx)
