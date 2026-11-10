---
title: "AI 동의와 채팅 요청을 하나의 세대로 관리하기"
description: "동의 완료 뒤 서버 재확인, 메시지 재전송과 히스토리 로딩의 늦은 응답을 구분했습니다."
date: "2026-11-10"
category: "Frontend"
tags: ["Unstiff","Zustand","Async","Chat","Consent"]
series: "Unstiff 개발기"
seriesOrder: 12
---

2026년 9월 #127과 #131에서 외부 AI 동의 진입과 채팅 상태를 연결했다. 동의 모달을 닫거나 말풍선을 하나 추가하는 것보다 중요한 것은 어떤 응답이 현재 대화의 상태를 바꿔도 되는지 정하는 일이었다.

## available과 externalAiAgreed는 다르다

채팅 진입 응답의 available은 대화를 사용할 수 있는 상태와 관련된 값이고, 외부 AI 처리 동의 여부는 externalAiAgreed가 기준이었다. 둘을 혼용하면 오늘 대화 가능 여부로 개인정보 동의 UI까지 결정하게 된다.

미동의 상태에서는 GET /terms의 EXTERNAL_AI를 찾아 contentUrl을 WebView로 표시했다. id와 URL은 하드코딩하지 않았다. 동의 버튼은 제출 중 상태를 막고 약관 동의 POST를 보낸 뒤, enter API를 다시 호출해 서버가 동의를 인정한 경우에만 대화 bootstrap으로 진행했다.

```text
enter → 동의 필요
→ 약관 조회 → 동의 POST
→ enter 재확인 → history/첫 질문 준비
```

로컬 체크박스를 켰다는 이유만으로 동의 완료로 이동하지 않았다. 거부하면 홈으로 이동하며, 설정에서 철회한 뒤 재진입하면 서버 상태로 다시 판단한다.

## 실패 종류가 재시도할 작업을 결정한다

첫 대화 조회 실패와 사용자 답변 저장 실패를 같은 retry로 처리하면 히스토리를 불필요하게 다시 받거나 사용자 말풍선을 중복 추가할 수 있다. 현재 store의 failure는 load와 send를 구분하며 send에는 재시도할 원문을 남긴다.

사용자 메시지는 최초 전송 시 한 번만 붙이고, 실제 POST를 수행하는 submitMessage는 assistant 응답만 이어 붙인다. 재전송에서 같은 사용자 bubble을 다시 만들지 않는다. 다만 서버의 재시도 저장 동작까지 이 프론트 저장소만으로 완전히 증명할 수는 없다. 서버 멱등 처리의 구현 성과로 확대하지 않는다.

## 늦은 응답에는 세대를 붙였다

store는 sessionGeneration을 증가시키고 비동기 흐름이 시작될 때 그 값을 캡처한다. 각 응답은 세대가 그대로일 때만 상태를 바꾼다. 핵심 구조를 줄이면 다음과 같다.

```ts
const generation = ++sessionGeneration;
const response = await request();
if (generation !== sessionGeneration) return;
// 현재 대화에만 반영
```

실제 코드는 enter, history, 첫 질문, 전송과 과거 페이지 로딩 각각에 이 검사를 둔다. reset이나 새 첫 페이지 요청 뒤 이전 응답이 오더라도 현재 메시지를 덮지 못하게 한다. 요청 자체를 Abort하는 방식이 아니라 결과를 버리는 방식이다.

전송·재시도·동의·초기 로딩의 pending 상태도 겹치지 않게 확인한다. 이전 history 페이지는 현재 메시지를 대체하지 않고 id 중복을 제거해 앞에 붙인다. 동일 cursor가 겹치는 요청과 이미 무효화된 세대의 응답은 다른 조건으로 막는다.

## 화면의 순서와 저장 순서

store는 오래된 순으로 메시지를 유지하고 inverted FlatList로 최신 대화가 하단에 보이도록 구성했다. 과거 페이지를 받았을 때 viewport를 유지하는 UI 처리와 store의 데이터 순서는 따로 봐야 한다. 오늘 마지막 assistant 메시지가 stop=true일 때만 대화 종료 상태를 표시한다.

#127은 iOS 시뮬레이터에서 동의 POST 연타 1회, 서버 재확인, 철회 후 모달 재노출을 확인했다. #131은 iOS 메시지 송수신과 과거 스크롤·종료 UI를 확인했고 Android/Web 확인은 남아 있었다. 모든 네트워크 실패와 응답 순서를 실기기에서 전수 검증했다고 표현하지 않는다.

## 참고한 변경과 코드

- [PR #127 · 외부 AI 동의](https://github.com/swyp6/unstiff-app/pull/127)
- [PR #131 · 비동기 상태와 재시도](https://github.com/swyp6/unstiff-app/pull/131)
- [채팅 store](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/features/chat/chat-store.ts)
- [채팅 화면](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/app/(tabs)/chat.tsx)
