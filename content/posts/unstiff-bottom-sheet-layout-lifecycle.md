---
title: "BottomSheet가 가려질 때 높이·inset·소유권을 나눠 봤다"
description: "스크롤 viewport와 키보드, NativeTabs의 하단 inset, FlatList 안 모달의 생명주기를 구분해 해결한 기록입니다."
date: "2026-11-10"
category: "Frontend"
tags: ["Unstiff", "React Native", "Android", "Safe Area", "BottomSheet"]
series: "Unstiff 개발기"
seriesOrder: 9
---

Unstiff QA에서 '바텀시트가 잘린다'는 증상은 여러 원인으로 발생했다. 2026년 9월 #180, #184, #186, #196, #198, #204를 비교하면 스크롤 높이, 하단 좌표, 화면 소유권이 서로 다른 문제였다는 것을 알 수 있다.

## 보이는 높이와 ScrollView 높이가 달랐다

#180은 접힌 시트의 하단 CTA까지 스크롤할 수 없는 문제였다. 접힌 상태에서도 내부 viewport가 펼친 높이를 기준으로 계산되어, 스크롤 영역의 일부가 실제 화면 아래에 있었다. 콘텐츠가 길다는 것만으로는 스크롤을 통해 버튼에 닿을 수 있다는 보장이 없다.

현재 snap 상태의 가시 높이로 contentMaxHeight를 계산했다. 펼칠 때는 viewport부터 확장하고, 접을 때는 애니메이션이 끝난 뒤 줄였다. 전환 도중 빈 영역이나 잘림이 생기는 것을 줄이기 위한 순서다. iPhone 17 시뮬레이터에서 긴 폼, 접기/펼치기 반복과 scroll offset 유지를 확인한 기록이 있다.

## 키보드가 열리면 누가 높이를 맡는가

#186은 키보드 표시 때 시트를 최대 높이로 확장하는 옵션을 넣었다. iOS는 keyboardWillShow, Android는 keyboardDidShow를 사용했다. 자식 입력 시트가 열렸을 때 부모까지 확장하지 않도록 옵션을 제어했다.

#196에서는 auto-height 신고 시트에도 이 옵션을 적용했다. 키보드가 뜰 때 시트의 바깥 높이는 제한하고, 넘치는 내용은 안쪽 ScrollView가 담당하게 했다. 시트 위치 이동과 콘텐츠 스크롤을 동시에 임의 보정하면 어떤 영역이 실제로 보이는지 추적하기 어렵다.

```text
바깥 시트: 화면·키보드에 맞는 최대 높이
안쪽 콘텐츠: 남은 영역에 맞춰 줄어듦
ScrollView: 넘치는 폼과 CTA에 접근
```

#186은 iOS 실기기 확인이 있지만 #196의 Android 신고 입력은 코드·정적 검사이고 실기기 최종 확인은 남았다. 비슷한 변경이라고 테스트 결과까지 같게 쓰지 않는다.

## Android 탭 내부에서는 inset이 이미 적용되어 있었다

#184의 CTA가 높이 뜨는 문제는 NativeTabs와 화면이 하단 inset을 중복 적용한 경우였다. Android + 탭 내부 경로에서만 추가 bottom inset을 제외하고 iOS와 탭 외부 모달은 유지했다.

그 뒤 #204에서는 CTA와 자식 BottomSheet가 서로 다른 하단 기준을 사용해 부모 버튼이 시트 밑에 보였다. z-index를 올리는 대신 호출 화면의 bottomInset을 같게 맞췄다. 공통 시트를 모든 플랫폼에 걸쳐 바꿀 필요는 없었다. #184는 실제 화면 비교 미완료였고, #204에는 Android 횟수·거리 시트의 CTA 노출과 닫기 동작 확인이 기록되어 있다.

## 키보드를 열었더니 신고 시트가 사라졌다

#198은 크기 조정만으로 해결되지 않았다. 각 ChatBubble이 신고 Modal을 소유했고, Android FlatList의 row clipping/virtualization 영향을 함께 받았다. 입력 시 위쪽 row가 화면 밖으로 나가면 그 row 아래의 신고 UI도 영향을 받을 수 있었다.

reportingMessageId를 ChatScreen으로 올리고 FlatList 밖에서 단일 신고 시트를 렌더하도록 바꿨다. 리스트 가상화를 끄는 대신 모달의 수명을 메시지 row와 분리한 것이다. 이 PR은 정적 검증은 통과했지만 Android 실기기 재현·재신고 확인 항목은 미완료였다.

같은 PR의 상태바 문제도 비슷했다. NativeTabs의 카메라 탭은 이동 후에도 마운트되어 있을 수 있어 light 상태바가 다른 탭에 남았다. focus일 때만 적용하는 변경은 '화면에서 안 보임'과 'unmount'가 다르다는 같은 기준을 따른다.

## 참고한 변경과 코드

- [PR #180](https://github.com/swyp6/unstiff-app/pull/180)
- [PR #184](https://github.com/swyp6/unstiff-app/pull/184)
- [PR #186](https://github.com/swyp6/unstiff-app/pull/186)
- [PR #196](https://github.com/swyp6/unstiff-app/pull/196)
- [PR #198](https://github.com/swyp6/unstiff-app/pull/198)
- [PR #204](https://github.com/swyp6/unstiff-app/pull/204)
- [공통 BottomSheet](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/components/ui/bottom-sheet.tsx)
- [채팅 화면의 신고 UI 소유권](<https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/app/(tabs)/chat.tsx>)
