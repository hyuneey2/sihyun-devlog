---
title: "스톱워치 재개와 종료 확인을 toggle 하나로 처리하지 않기"
description: "음수 시간 차이의 원인과 모달이 열린 시간을 제외하는 정산·재개 흐름을 정리했습니다."
date: "2026-11-10"
category: "Frontend"
tags: ["Unstiff","React Native","Timer","State"]
series: "Unstiff 개발기"
seriesOrder: 13
---

2026년 9월 #176에서는 스톱워치를 재개한 순간 누적 시간이 잠깐 줄어 보였다. 이어 #207에서는 운동 완료 체크와 종료 모달을 정리했다. 둘 다 timer 문제처럼 보이지만, 실제로는 서로 다른 시점의 상태를 합치는 방식이 원인이었다.

## interval은 시간의 원본이 아니다

스톱워치는 완료된 구간의 elapsedSeconds와 현재 실행 구간의 startedAt을 보관했다. 화면의 now는 interval tick에서 갱신된다. 일시정지 중 마지막 tick에 멈춰 있는 now보다 재개 시 새 startedAt이 더 늦으면, 첫 tick 전에는 now - startedAt이 음수가 된다.

```text
누적 60초에서 일시정지
마지막 화면 now = 10:00:00
재개 startedAt = 10:00:10
첫 tick 전 계산 = 60 + (-10) → 누적 시간이 줄어 보임
```

#176은 누적 시간을 임의로 늘리는 대신 현재 구간의 경과만 0 이상으로 제한했다.

```ts
elapsedSeconds + Math.max(0, now - startedAt) / 1000
```

새 구간에서 아직 관측된 시간이 없다면 경과 0이 맞다. interval 생성/cleanup과 pause/resume 구조는 이 PR에서 바꾸지 않았다.

## 완료 가능 여부도 같은 계산을 사용했다

#207에서는 아직 시작하지 않았거나 1초 미만이면 완료 체크를 막았다. 문자열로 그린 '00:01'을 파싱하는 대신 getStopwatchElapsedSeconds의 숫자를 기준으로 판단했다. 화면 표시와 버튼 활성화가 같은 시간 정의를 공유해야 서로 엇갈리지 않는다.

일시정지 버튼은 순수 일시정지만 수행하고, 완료 체크에서만 종료 확인을 열었다. 사용자에게 보이는 동작과 내부 상태 전환도 같은 이름으로 설명할 수 있게 됐다.

## 모달이 열린 시간은 운동 시간인가

실행 중 완료를 누를 때 정확한 현재 시각으로 elapsed를 정산하고 정지한다. 모달 대상에는 wasRunning과 정산한 elapsedSeconds를 보관한다. 취소하면 정산값을 유지한 채 startedAt만 취소 시각으로 새로 설정한다.

```text
실행 → 체크 시점 정산·정지 → 확인 모달
                           ├ 확인: 완료
                           └ 취소: 같은 누적값, 새 startedAt으로 재개
```

이 과정에 기존 toggle 함수를 재사용하면 모달 도중 바뀐 isRunning을 보고 의도와 반대 방향으로 움직일 수 있다. settle과 resume을 별도 함수로 만든 이유다. 모달에서 보낸 시간을 elapsed에 추가하지 않는다는 정책도 명확해졌다.

종료 확인 버튼에는 ref 잠금을 둬 같은 프레임의 연타로 완료 처리와 기록 모달이 두 번 열리지 않게 했다. 확인 대상이 바뀔 때 잠금을 초기화하므로 다음 운동의 종료까지 막지 않는다.

#176은 시작·정지·반복 재개·interval 중복 여부 확인 기록이 있다. #207은 실기기에서 모달 시간이 더해지는 현상을 원인 주석으로 남겼고 정적 검사 통과와 동작 확인을 기록했지만 플랫폼별 상세 테스트 목록은 충분하지 않다. 기기 시계 변경이나 장시간 background 같은 모든 timer 조건을 해결한 구현이라고 확대하지 않는다.

## 참고한 변경과 코드

- [PR #176 · 음수 경과 보정](https://github.com/swyp6/unstiff-app/pull/176)
- [PR #207 · 완료 정산·취소·중복 방지](https://github.com/swyp6/unstiff-app/pull/207)
- [스톱워치 표시와 확인 모달](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/features/workout-plan/components/home-workout-cards.tsx)
- [정산·재개 상태 갱신](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/app/(tabs)/home.tsx)
