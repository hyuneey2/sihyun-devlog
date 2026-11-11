---
title: "서버 전체 장애에서 Snapshot을 읽고 입력을 지킨 채 복구하기"
description: "59개 공개 지역의 두 파일 검증, SPA HTML 응답, 무응답 유예와 상태 유지 복구를 다룹니다."
date: "2026-11-10"
category: "Frontend"
tags: ["LocalLens", "Snapshot", "SHA-256", "Fallback", "Zustand"]
series: "LocalLens 개발기"
seriesOrder: 5
---

계산만 브라우저로 옮겨도 지역 자료를 못 받으면 아무것도 계산할 수 없다. 2026년 11월 #16은 전체 장애용 Snapshot 로더와 복구 흐름을 추가했고, #17은 공개 가능한 59개 지역을 실제 정적 파일로 나눴다. #16의 72곳 비공개 검증과 #17 이후 공개 범위를 같은 상태로 설명하지 않는 것이 출발점이다.

## 자료 출처와 계산 출처는 독립적이다

store는 dataSource를 server/snapshot으로, 계산 결과의 source를 server/estimated로 기록한다. 자료 API만 실패하면 저장 자료와 서버 계산을 조합할 수 있고, 계산 API만 실패하면 서버 자료와 브라우저 추정을 조합할 수 있다.

```text
서버 정상       → 서버 자료 + 서버 계산
계산 API 장애   → 서버 자료 + 브라우저 추정
전체 장애 59곳  → 저장 자료 + 브라우저 추정
전체 장애 13곳  → 미지원 안내, 값 생성 없음
```

'오프라인'이라는 한 개 boolean으로 묶으면 수집일 안내와 계산 한계를 정확하게 표시하기 어렵다.

## 목록과 지역 자료를 한꺼번에 받지 않는다

manifest에는 수집일, 지역 목록, 미지원 목록, 파일 경로·크기·SHA-256 등이 있다. 공개 schema 3은 지역 공공데이터 파일과 osm/ 지역 파일이 분리되고, 목록용 OSM 파생 지표도 osm/index.json에 있다. 목록 카드를 보여 주려고 모든 지역 JSON을 받지 않도록 했다.

사용자가 지역을 고르면 두 파일을 병렬로 받고 mergeRegion으로 합친다. 한쪽이 없거나 검증에 실패하면 그 지역 자료 전체를 쓰지 않는다. 성공한 요청은 페이지 내 캐시에 남기지만 실패는 캐시에서 제거해 배포 정정 뒤 재시도할 수 있다.

## HTTP 200이 JSON 성공은 아니었다

SPA 호스팅에서는 없는 파일 경로가 index HTML을 200으로 돌려줄 수 있다. readBytes는 content-type이 text/html이면 거부하고, 바이트를 읽은 뒤 JSON 파싱과 hash를 검사한다. 합친 결과에는 지역 코드·이름·등급·마을 수, 필수 칸과 경계 구조 검사도 적용한다.

SHA-256은 보안 컨텍스트의 crypto.subtle을 사용할 수 있을 때 manifest의 값과 비교한다. 사용할 수 없으면 형식 검사만 하는 경로가 있다. 모든 환경에서 hash 검증이 강제된다고 말할 수 없다. 또한 manifest까지 함께 바뀐 배포의 진위를 독립적으로 보증하는 서명 체계는 아니다.

## 답이 없는 서버에는 4초만 먼저 기다린다

연결 실패나 5xx는 요청이 곧바로 실패하지만, 무응답 서버는 사용자에게 긴 대기를 남긴다. 지역 목록·자료가 GRACE_MS 4초 안에 오지 않으면 정적 자료를 먼저 표시하고 markHung으로 data/judge/plans 장애를 60초 동안 기억한다. 정적 호스팅의 파일 요청에는 별도의 15초 제한이 있다.

유예가 지났다고 늦은 서버 응답을 무조건 버리지는 않는다. 아직 같은 지역·요청이면 서버 자료가 도착한 뒤 전환할 수 있다. 이미 다른 지역을 선택했다면 이전 응답이 새 화면을 덮지 않게 검사한다.

## 복구할 때 화면부터 비우지 않았다

버튼과 자동 확인은 가벼운 health 요청으로 시작한다. 장애 상태일 때 60초 주기, 탭 복귀와 online 이벤트를 통해 복구를 확인하고 정상 상태에서는 불필요한 polling을 하지 않는다.

refreshRegion은 기존 화면과 입력을 둔 채 새 자료를 받는다. 앱에서 쓰는 칸이 같으면 객체를 유지해 지도·입력이 흔들리지 않게 하고, 다르면 이전 자료의 계산 결과를 무효화해 다시 계산한다. 지역·예산·목표·공급수단·단가·선택안·What-if 예산을 보존하는 흐름이다.

무응답 요청이 페이지 이탈 후에도 살아 HTTP 캐시 잠금을 잡는 문제는 #15에서 pagehide 취소로 보완했다. 대가로 요청 중 떠났다가 뒤로 돌아오면 새로 로드되어 화면 조건이 초기화될 수 있다. 화면 내 복구의 입력 보존과 페이지 이탈 후 복원은 다른 보장이다.

## 완전한 인터넷 오프라인 지원과는 다르다

공개 자료가 없는 13곳, 손상 파일, 외부 지도 타일, AI 질문과 서버 공문에는 제약이 있다. 앱과 자료를 사이트에서 받아야 하므로 PWA 완전 오프라인 구현은 아니다. 문서의 2026-11-07 검증은 로컬 wrangler dev와 장애 프록시이며 실제 CDN 배포 검증은 포함하지 않았다.

## 참고한 변경과 코드

- [PR #16 · 전체 장애 코드·비공개 검증](https://github.com/ai-life-challenge/ai-life-FE/pull/16)
- [PR #17 · 공개 59곳](https://github.com/ai-life-challenge/ai-life-FE/pull/17)
- [정적 자료 로더](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/src/api/snapshot.ts)
- [상태·복구](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/src/store.ts)
- [구조·검증·미지원 범위](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/docs/offline-snapshot.md)
- [장애·복구 테스트](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/src/store.offline.test.ts)
- [PR #15 · pagehide 취소](https://github.com/ai-life-challenge/ai-life-FE/pull/15)
