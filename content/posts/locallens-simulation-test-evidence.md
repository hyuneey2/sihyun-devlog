---
title: "지역별 계산·파일·장애 테스트가 각각 증명하는 것"
description: "전 지역 불변식, 서버 대조, 손상·복구 시나리오를 분리하고 과거 테스트 수의 조건과 한계를 기록했습니다."
date: "2026-11-10"
category: "Frontend"
tags: ["LocalLens", "Vitest", "Testing", "Simulation", "Snapshot"]
series: "LocalLens 개발기"
seriesOrder: 8
---

LocalLens의 테스트를 볼 때 '몇 개 통과했다'보다 어떤 실패를 잡고 어떤 자료에서 실행했는지 먼저 확인했다. 2026년 11월 #15~#17의 계산·Snapshot 변경은 단위 테스트, 실제 데이터 검사, 서버 대조, 브라우저 장애 시나리오를 나눠 검증한다. 이 글의 수치는 당시 저장소 기록이며 이번 블로그 작업에서 앱 테스트를 재실행한 결과는 아니다.

## 1. 모든 지역에 적용할 불변식

snapshot-all.test는 공개 폴더, 비공개 폴더 또는 지정 경로의 실제 자료를 읽는다. 지역별 파일·마을 id·읍면 연결·인구 합계가 맞는지 확인하고, 세 나이대 판정과 자가용 판정을 수행한다.

계산 결과는 NaN, Infinity, undefined가 없어야 한다. 기본 예산, 0.5억, 30억·목표 100%, 전체 주민, 원격진료만 허용한 경우 등을 돌려 coverage 길이·추천안 1개·예산 준수·지역 id 범위를 검사한다. 주민이 없어 추정할 수 없는 경우는 정상적인 EstimateError로 다루며 값으로 채우지 않는다.

```text
형식·관계 검사
→ 판정·마을 카드
→ 여러 입력의 대안·민감도
→ 유한한 수치 / 예산 / 인구·배치 불변식
```

이 검사는 자료마다 끝까지 계산 가능한지 확인하지만 서버 최적화와 같은 결과인지는 증명하지 않는다.

## 2. 파일 분리 전후의 동등성

public-snapshot.test는 공개 59곳과 보류 13곳, 금지된 파일과 칸의 부재를 검사한다. 비공개 전체본이 있을 때는 공개 파일을 합친 JSON 값과 계산 결과를 대조한다.

비공개 자료가 없는 CI에서는 해당 대조를 건너뛴다. skipIf 조건을 보지 않고 CI 녹색 표시만으로 비공개 전체본 대조까지 완료했다고 말할 수 없다. snapshot-all도 자료 폴더가 있어야 실행된다. 자료가 필요한 검사와 순수 로직 검사를 분리해 읽어야 한다.

## 3. 서버와 추정의 차이는 별도 대조한다

compare-estimate.test는 환경변수로 허용했을 때만 운영 서버를 호출하는 수동 대조다. 일반 테스트의 통과 수와 실제 서버 비교 건수는 같은 지표가 아니다.

문서의 2026-11-05 표본 대조에는 추천 불일치와 추정만 목표를 달성한 경우가 남아 있다. 서버와의 일치만 강제해 차이를 숨기는 대신, 오차·입력 조건·표본 범위를 기록했다. 서버 응답이 실제 정책적으로 옳은지까지 검증하는 범위도 아니다.

## 4. 장애는 상태 전환으로 검사한다

store.fallback.test는 계산 API만 실패하는 경우, 400 입력 오류, 잘못된 배치·coverage, 실제 자료 없음, 동일 조건 요청 공유 등을 다룬다. store.offline.test는 최초 방문의 전체 장애, 4초 무응답 유예, 늦은 서버 응답, HTML·손상·다른 지역 파일, 부분 API 장애, 미지원 13곳과 복구를 확인한다.

복구 테스트의 중요한 기준은 결과가 서버 값으로 바뀌었다는 것뿐 아니라, 그동안 고른 예산·목표·공급수단·단가·선택안과 What-if 값이 유지되는가다. 실패 후 재요청과 성공 파일 캐시의 동작도 별도 조건이다.

## 2026-11-07 기록을 읽는 방법

offline-snapshot 문서는 공개 자료가 포함된 production build를 로컬 wrangler dev와 장애 프록시에서 확인한 결과를 남긴다. 자동 테스트 574개 통과·2개 건너뜀, 브라우저 시나리오 111개 통과다. 건너뛴 2개는 운영 서버 대조용이다.

이 기록에는 실제 Cloudflare 배포/CDN, Firefox·Safari·모바일, 정상 /api/ask 호출이 포함되지 않는다. 헤드리스에 WebGL이 없어 지도 렌더가 빠진 시나리오도 있으며, 결과 지도 자체는 이번에 눈으로 확인하지 못했다고 적혀 있다.

테스트 수를 포트폴리오의 성능 수치처럼 옮기기보다 자료·런타임·실행 조건과 확인하지 못한 영역을 붙여야, 다음 사람이 무엇을 다시 검증해야 하는지 알 수 있다.

## 참고한 변경과 코드

- [검증 일자·환경·미검증 영역](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/docs/offline-snapshot.md)
- [전 지역 계산 검사](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/scripts/snapshot-all.test.ts)
- [공개본·비공개본 대조](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/scripts/public-snapshot.test.ts)
- [장애·복구 store 테스트](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/src/store.offline.test.ts)
- [계산 fallback 테스트](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/src/store.fallback.test.ts)
- [수동 서버 대조](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/scripts/compare-estimate.test.ts)
- [PR #15](https://github.com/ai-life-challenge/ai-life-FE/pull/15)
- [PR #16](https://github.com/ai-life-challenge/ai-life-FE/pull/16)
- [PR #17](https://github.com/ai-life-challenge/ai-life-FE/pull/17)
