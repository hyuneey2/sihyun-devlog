---
title: "What-if 예산을 바꿔도 기준 결과를 잃지 않게 하기"
description: "계산 입력 key, 미확정 예산, 응답 취소와 출처별 캐시를 분리해 대안을 비교했습니다."
date: "2026-11-10"
category: "Frontend"
tags: ["LocalLens","Zustand","React","Simulation","Async"]
series: "LocalLens 개발기"
seriesOrder: 3
---

LocalLens의 예산 화면은 목표와 공급수단을 입력받고 서버 대안 3개를 비교한다. What-if에서는 '예산이 달라지면?'을 별도로 실험한다. 2026년 10~11월 #13, #15와 현재 store/WhatIf를 검토하며, 슬라이더 숫자와 계산 기준을 하나의 상태로 쓰면 비교의 기준 자체가 움직일 수 있다는 점을 정리했다.

## 무엇을 바꾸면 무엇을 다시 계산하는가

지역, 서비스, 나이대, 기준, 가정값, 허용 공급수단, 예산, 목표는 대안 계산의 입력이다. store의 calcKey는 이 값들을 직렬화한다. 반면 마을 판정에는 예산이 필요 없어 judgeKey에서 제외한다. 보고서는 고른 안과 편집 문단까지 필요하므로 reportKey가 더 넓다.

```text
judgeKey: 지역 + 서비스 + 나이대 + 접근 기준
calcKey:  위 값 + 가정 + 공급수단 + 예산 + 목표
reportKey: calcKey + 고른 안 + 편집 내용
```

선택 마을이나 화면에서 보여줄 안만 바꿨다고 서버 대안을 새로 계산할 필요는 없다. 같은 조건의 요청이 이미 진행 중이면 Promise를 공유하고, 같은 slot의 다른 조건 요청은 AbortController로 앞 요청을 중단한다. key가 맞는 결과인지 확인해 오래된 계산을 현재 조건의 결과로 쓰지 않도록 한다.

## 기준 예산과 실험 예산을 분리했다

WhatIf는 store의 st.budget을 기준으로 두고 raw/next라는 로컬 값을 사용한다. raw는 사용자가 움직이는 값이고 next는 250ms debounce 뒤 실제 계산에 쓸 값이다. 확정하기 전까지 기준 State를 변경하지 않는다.

결과를 받았다고 기준 예산까지 바로 바꾸면 원래 대안과 바뀐 대안을 비교할 수 없다. 화면은 기준 결과와 next 예산의 결과를 함께 보여 준다. 실험값을 확정하는 동작이 기준 State 갱신의 경계가 된다.

## 배열의 마지막이 적극 투자안이라는 가정

data-audit는 과거 What-if 곡선이 plans[length - 1]에 의존한 문제를 기록했다. #13 이후 곡선과 최대 달성안 선택은 k === 2를 사용한다.

```ts
const best = p.plans.find((x) => x.k === 2);
```

k는 비용 절감 0, 균형 1, 적극 투자 2라는 서버 계약이다. 화면 배열의 우연한 위치와 안의 의미를 분리한 변경이다. 현재 비교 표의 각 행은 여전히 응답 배열 위치를 대응하므로 모든 렌더가 id 매칭으로 바뀌었다고 쓰지는 않는다.

## 서버와 추정 캐시를 같은 칸에 넣지 않았다

What-if는 예산별 대안을 memo에 보관한다. 캐시 key에는 계산 조건뿐 아니라 server/estimated 출처가 포함된다. 같은 예산이어도 두 계산은 다른 결과이기 때문이다.

중간 요청이 복구 가능한 장애로 실패하면 표 일부만 추정으로 채우지 않고 기준안·바꾼 예산·곡선을 모두 추정으로 전환한다. 서버 결과와 근사 결과의 차이가 마치 예산 변경 효과처럼 보이지 않도록 비교 조건을 맞춘다.

곡선은 여러 예산을 하나씩 계산해 도착할 때마다 그린다. 추정 모드에서는 각 계산 전에 이벤트 루프에 제어를 돌려 긴 연속 작업으로 화면이 멈추는 것을 줄인다. 서버 장애 중에는 health 확인으로 복구를 확인하고 표 전체를 다시 서버 기준으로 돌리는 경로가 있다.

## 지도와 계산의 식별자도 맞춰야 했다

#15에는 DRT 범례를 눌러도 지도가 이동하지 않던 수정도 있다. 마을의 myeon은 id, 공급 배치의 myeon은 이름인데 직접 비교하고 있었다. data.myeons로 이름을 id에 연결했다. 같은 단어라고 같은 식별자 타입이 아니었다.

PR #15는 로컬 장애·복구와 WebGL 지도 테스트 결과를 기록하지만, 조건·시점별 실행 범위가 다르다. 이 글은 현재 구현과 당시 기록을 바탕으로 상태 책임을 설명하며 새 운영 계산을 수행한 결과는 아니다.

## 참고한 변경과 코드

- [PR #13 · What-if 식별자](https://github.com/ai-life-challenge/ai-life-FE/pull/13)
- [PR #15 · 출처 전환·DRT 지도](https://github.com/ai-life-challenge/ai-life-FE/pull/15)
- [계산 key와 요청 slot](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/src/store.ts)
- [What-if 구현](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/src/screens/WhatIf.tsx)
- [기준 감사 기록](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/docs/data-audit.md)
