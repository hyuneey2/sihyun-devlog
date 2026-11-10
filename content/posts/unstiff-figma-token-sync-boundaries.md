---
title: "Figma Variables를 앱 토큰으로 옮길 때 값보다 먼저 정한 것"
description: "파일 export와 REST 입력, 컬렉션별 mode·alias 해석, NativeWind와 React Native 스타일 출력의 경계를 정리했습니다."
date: "2026-11-10"
category: "Frontend"
tags: ["Unstiff","Figma","Design Tokens","NativeWind"]
series: "Unstiff 개발기"
seriesOrder: 15
---

Unstiff 저장소에는 scripts/sync-figma-tokens.js와 로컬 token-export 플러그인이 있다. 이 글은 현재 구현 코드를 읽고 팀의 토큰 전달 경로를 정리한 기록이다. 별도 성능 향상이나 Figma 파일에 대한 새 작업 결과를 주장하는 글은 아니다.

## 입력 경로를 하나의 변환기로 모았다

프로젝트 문서는 팀 플랜에서 file_variables:read REST scope를 사용할 수 없어 로컬 개발 플러그인으로 Variables JSON을 내보내는 경로를 설명한다. 이것은 당시 팀 환경의 제약이며, 모든 Figma 계정의 현재 요금제 권한을 일반화한 설명은 아니다.

sync 스크립트는 export 파일이 있으면 우선 읽고, 없으면 환경변수로 REST API를 호출한다. --input으로 다른 경로를 지정할 수도 있다. 어느 경로로 받든 뒤의 변환과 파일 출력은 같다.

```text
로컬 plugin JSON / REST 응답
→ alias·mode 해석
→ 색상·타입 스케일·radius
→ tailwind.tokens.js + src/constants/tokens.ts
```

디자인 값을 여러 화면에 다시 복사하지 않고 NativeWind와 직접 style을 쓰는 코드가 같은 원천에서 파생되게 한 구조다.

## alias의 mode ID는 컬렉션 사이에서 같지 않다

resolveValue는 변수 자신이 속한 컬렉션의 defaultModeId로 값을 읽는다. alias가 다른 컬렉션으로 이어지면 대상 변수의 컬렉션을 기준으로 다시 읽는다. 참조하는 쪽의 mode ID를 그대로 쓰면 대상 컬렉션에는 그 ID가 없거나 잘못된 값을 고를 수 있다.

재귀 중 seen 집합에 변수 id를 넣고 다시 등장하면 순환 alias 오류를 낸다. 잘못된 값을 조용히 만들어 출력하는 대신 변환을 중단한다. 다만 모든 누락 참조를 친절한 오류로 설명하는 완성된 검증기라고 볼 수는 없다.

기본 mode 값을 출력하는 스크립트이지 앱의 모든 light/dark mode를 자동 생성하는 구현도 아니다. 테마 전환 지원 범위는 실제 출력과 소비 코드를 따로 봐야 한다.

## 타이포그래피는 Variables만으로 충분하지 않았다

스크립트의 TYPOGRAPHY_SCALE은 이름과 weight 대응을 코드 표로 둔다. Variables에서 font-size/line-height를 가져와도 폰트 family와 weight 전체가 같이 오는 것은 아니기 때문이다. 필수 크기·줄높이가 없으면 throw하도록 했다.

React Native의 로컬 Pretendard 폰트는 등록한 family 이름에 weight가 포함된다. 생성한 typography는 Pretendard-Regular처럼 family를 선택한다. 특정 weight의 커스텀 폰트에 fontWeight를 추가하는 방식과 구분한 프로젝트의 대응이다.

색상은 RGBA를 hex로 변환하고, 알려진 primitive 그룹과 semantic 이름을 분리한다. Tailwind 출력의 px 문자열과 Native 스타일의 숫자 값도 구분한다.

## 자동 생성이 디자인 검토까지 대신하지는 않는다

파일 export는 디자이너의 변경을 자동 구독하지 않는다. 새 JSON을 가져와 sync를 실행하고 생성 diff를 검토해야 한다. 변수 이름을 바꾸면 사용처와 코드의 스케일 표가 어긋날 수도 있다. 현재 코드에도 아직 토큰에 포함되지 않은 surface 값을 화면에서 직접 정의한 흔적이 있다.

이번 글에서는 Figma 접근이나 sync를 새로 실행하지 않았다. 구현과 README로 입력 선택, alias 순환 검사, 필수 typography 검사를 확인했다. 토큰은 값의 복사가 아니라 서로 다른 도구가 같은 이름·단위·모드를 해석하는 계약이라는 기준으로 다뤘다.

## 참고한 변경과 코드

- [토큰 변환 스크립트](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/scripts/sync-figma-tokens.js)
- [팀 로컬 export 절차](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/figma-plugin/token-export/README.md)
- [앱 생성 토큰](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/constants/tokens.ts)
- [NativeWind 생성 토큰](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/tailwind.tokens.js)
