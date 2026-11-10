---
title: "router.replace 뒤에 잠금을 풀면 운동 기록이 두 번 저장될 수 있다"
description: "같은 프레임의 연타와 화면 전환 완료 전 재진입을 나눠 보고, 성공 시 제출 잠금을 유지한 이유를 정리했습니다."
date: "2026-11-10"
category: "Frontend"
tags: ["Unstiff","Expo Router","Race Condition","React","API"]
series: "Unstiff 개발기"
seriesOrder: 6
---

2026년 9월 #106에서 신규 운동 기록을 단일 POST로 바꾸며 제출 잠금도 수정했다. 문제는 네트워크 요청 중 버튼만 막으면 끝나는 일이 아니었다. 성공 응답을 받은 뒤에도 이전 화면이 전환 중에 살아 있어 같은 요청이 다시 시작될 수 있었다.

## 두 개의 시간이 겹친다

첫 번째 간격은 setState와 다음 렌더 사이다. isSubmitting을 true로 설정해도 같은 프레임에서 다시 호출된 핸들러는 이전 렌더의 false를 볼 수 있다. 신규 기록은 refId 없이 서버에 계획과 기록 생성을 맡기므로 두 번 호출되면 두 데이터가 중복 생성될 수 있다.

두 번째 간격은 router.replace 호출과 실제 화면 제거 사이다. 요청이 성공한 후 finally에서 isSubmitting을 false로 만들면, 이동 중인 기존 화면이 다시 제출 가능한 상태가 된다.

```text
POST 성공
→ replace 호출
→ finally에서 잠금 해제
→ 이전 화면이 아직 입력을 받음
→ 같은 POST 재실행 가능
→ 화면 전환 완료
```

replace는 이동 요청이지 컴포넌트가 즉시 unmount되었다는 증명이 아니다. 이 순서를 빼고 비동기 요청의 try/finally만 보면 중복 구간을 찾기 어렵다.

## UI 상태와 진입 잠금을 따로 뒀다

현재 manual-record와 공통 record-editor-screen은 ref를 동기적인 진입 잠금으로 사용한다. 아래는 해당 분기의 구조만 줄인 코드다.

```tsx
if (submissionLockRef.current || !canSubmit) return;
submissionLockRef.current = true;
setIsSubmitting(true);
try {
  await saveWorkoutRecord(payload);
  // 완료 스냅샷과 홈 갱신 신호를 저장한다.
  router.replace("/record-complete");
  // 성공 경로에서는 잠금을 해제하지 않는다.
} catch {
  submissionLockRef.current = false;
  setIsSubmitting(false);
  // 입력 화면에 남아 다시 시도할 수 있게 한다.
}
```

ref는 다음 렌더를 기다리지 않고 두 번째 핸들러를 막는다. isSubmitting은 버튼 비활성화와 화면 표현에 사용한다. 두 값이 비슷해 보여도 서로 다른 시간 간격을 담당한다.

#106 diff에서 finally가 제거되고 실패 분기에서만 잠금과 UI 상태를 해제한 것을 확인할 수 있다. 성공한 화면은 제출 완료 상태를 유지한 채 교체되므로 전환 중 새 요청을 허용하지 않는다.

## 무조건 잠그는 것도 답은 아니다

실패했는데 잠금을 유지하면 사용자가 입력을 다시 제출할 수 없다. 성공과 실패의 다음 행동이 다르므로 해제 지점도 달라야 한다. 반대로 새 기록을 입력하는 다른 인스턴스까지 전역 잠금을 유지하면 정상적인 다음 기록을 막게 된다. 이 잠금은 화면 인스턴스의 수명에 맞춘 로컬 ref다.

이것은 클라이언트 중복 입력을 줄이는 보호다. 응답을 받기 전에 연결이 끊겼는데 서버는 이미 저장한 상황, 여러 기기나 앱 재시작에 걸친 동일 요청까지 멱등하게 만드는 것은 아니다. 서버 idempotency key가 구현되었다는 근거는 없어 그렇게 주장하지 않는다.

## 어떻게 확인했는가

#106에는 iOS 시뮬레이터에서 신규 기록과 미션 기록 저장, 신규 기록의 중복 생성 방지, 기존 PLAN/MISSION 흐름 유지가 확인되어 있다. 전체 lint는 당시 기존 expo-media-library/legacy 오류로 통과하지 못했다. 현재 코드에서도 성공 시 잠금 유지와 catch에서만 해제하는 구조가 남아 있다.

이번 글 작성 과정에서는 PR diff와 현재 코드를 대조했으며, 모바일 앱을 새로 실행한 것은 아니다. 같은 프레임 연타와 '성공했지만 아직 떠나지 않은 화면'을 각각 재현 조건으로 보는 것이 이 수정의 핵심이다.

## 참고한 변경과 코드

- [PR #106 · finally 제거와 제출 잠금](https://github.com/swyp6/unstiff-app/pull/106)
- [신규 기록 제출](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/app/(tabs)/capture/manual-record.tsx)
- [연결 기록 제출](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/features/workout-record/components/record-editor-screen.tsx)
