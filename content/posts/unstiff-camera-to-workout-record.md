---
title: "촬영부터 운동 기록 완료까지, 비동기 작업의 경계를 나누기"
description: "시스템 카메라 전환, 사진 업로드, 기록 대상 선택과 refId 매칭을 하나의 데이터 흐름으로 연결했습니다."
date: "2026-11-10"
category: "Frontend"
tags: ["Unstiff","React Native","Camera","API","Async"]
series: "Unstiff 개발기"
seriesOrder: 5
---

Unstiff의 운동 기록은 사진을 찍고 저장 버튼을 누르는 두 동작으로 끝나지 않았다. 2026년 9~10월 #80, #106, #190, #229를 거치며 촬영 수단, 업로드 결과, 기록 대상, 서버에 저장된 기록을 각각 다른 상태로 다뤘다.

## 사진은 어디서 왔고 무엇을 저장했는가

#80에서는 expo-camera 기반 촬영과 재촬영, 하단 카메라 탭 → 대상 선택 → 실제 수행값 입력 → 완료를 연결했다. #229에서는 시스템 카메라로 전환했다. iOS 실기기에서 자동 실행·취소·재진입·권한 상태를 확인한 후속 구현이다. Android 실기기 확인은 당시 미완료였다.

현재 system-camera.ts는 시스템 결과를 captured, canceled, invalid로 나눈다. 취소와 잘못된 응답을 같은 업로드 실패로 처리하지 않는다. captured인 경우에도 URI와 양수인 width/height를 확인해 공통 RecordPhotoFile로 변환한다.

```text
시스템 촬영 / 앨범 선택
→ { uri, width, height }
→ 업로드
→ secureUrl
→ 연결 대상이 있으면 기록 입력, 없으면 대상 선택
```

로컬 URI는 서버에서 읽을 수 있는 주소가 아니다. submitRecordPhoto는 업로드를 기다려 secureUrl을 얻은 뒤 store에 넣는다. 그 사이 사용자가 화면을 떠났다면 shouldContinue가 false를 반환해 store 수정과 화면 이동을 멈출 수 있다. 이미 시작한 업로드 자체를 취소하는 구현이라고 설명해서는 안 된다.

## 같은 PLAN이라도 저장 계약은 다르다

기존 계획이나 미션에 연결하는 LINKED는 refType과 실제 서버 refId를 보낸다. 새 운동을 즉석에서 적는 MANUAL은 연결할 id가 없다. #106은 'daily-plan 생성 → workout 생성'을 POST /workouts 한 번으로 바꿨다. 이 요청은 refType PLAN과 name, exerciseType, targetDate를 보내고 refId는 보내지 않는다.

UI의 MANUAL이라는 모드 이름을 서버 refType으로 만들어 보내거나 0, -1 같은 가짜 id를 넣지 않았다. 서버 계약을 클라이언트 편의에 맞춰 추정하면 서로 다른 작업을 같은 기록으로 연결할 수 있기 때문이다.

성공 후에는 confirmed에 서버가 발급한 기록 id와 실제 전송한 measures를 고정했다. 입력 중 photo/target이 초기화되어도 완료 화면은 저장된 값으로 그릴 수 있다. measures는 API 단위인 초/m로 보관하고 표시할 때만 변환한다.

## 제목이 같으면 기록을 찾을 수 없었다

#190 이전에는 PLAN 기록을 refType + name으로 찾았다. 같은 날 '걷기'가 두 개면 어느 기록을 열지 결정할 수 없다. 첫 번째 항목을 여는 fallback은 틀린 기록을 수정할 위험이 있다.

서버 응답에 refId가 추가된 뒤, PLAN은 daily-plan id, MISSION은 mission id로 비교했다.

```ts
entry.refType === "PLAN" && String(entry.refId) === instanceId
```

기록 자체의 id와 기록 대상의 refId도 다르다. 전자는 기록 수정 API에, 후자는 홈 항목과 기록의 연결에 쓴다. 상세 라우트의 기존 date/index 구조는 유지하면서 매칭 조건만 바꿨다. 정확한 대상을 찾지 못하면 오류 안내를 유지했다.

## 성공 신호도 입력 초안과 분리했다

markRecordSaved는 홈이 캘린더·미션·운동 목록을 다시 읽게 하는 시각 신호다. reset에서 이 신호까지 지우면 완료 화면을 닫은 뒤 홈이 갱신 사실을 놓칠 수 있다. 그래서 draft와 confirmed는 비워도 savedRecordAt은 남긴다.

#80의 기록 저장 성공과 미션 완료 요청 실패도 같은 성공 여부로 뭉개지 않았다. 기록이 저장되었으면 그 상태를 유지하고 미션은 이후 서버 조회로 보정하는 흐름이었다. 촬영 성공, 업로드 성공, 기록 저장 성공은 각각 다른 경계이며, 어느 경계를 통과했는지가 재시도 정책을 결정한다.

## 참고한 변경과 코드

- [PR #80 · 초기 기록 흐름](https://github.com/swyp6/unstiff-app/pull/80)
- [PR #106 · 단일 저장 API](https://github.com/swyp6/unstiff-app/pull/106)
- [PR #190 · refId 매칭](https://github.com/swyp6/unstiff-app/pull/190)
- [PR #229 · 시스템 카메라 전환](https://github.com/swyp6/unstiff-app/pull/229)
- [촬영 결과와 권한](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/features/camera/system-camera.ts)
- [업로드 후 전환](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/features/workout-record/submit-record-photo.ts)
- [기록 상태와 완료 스냅샷](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/features/workout-record/record-flow-store.ts)
