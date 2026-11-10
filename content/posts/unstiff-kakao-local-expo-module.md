---
title: "KakaoMapsSDK를 로컬 Expo Module로 연결하며 나눈 책임"
description: "Config Plugin, Swift Native View, JS props를 분리하고 지도 엔진을 뷰 생명주기에 맞춰 관리한 초기 iOS 연동입니다."
date: "2026-11-10"
category: "Frontend"
tags: ["Unstiff","Expo","Swift","KakaoMapsSDK","Native Module"]
series: "Unstiff 개발기"
seriesOrder: 2
---

2026년 8월 PR #10에서 KakaoMapsSDK의 초기 iOS 연동을 맡았다. 외부 React Native wrapper 대신 로컬 Expo Module로 Native SDK와 앱을 연결했다. 이때 구현한 것은 지도 렌더링과 카메라 위치 제어다. GPS·현재 위치 권한 연결과 Android/Web 구현까지 완료한 작업은 아니다. **현재 develop에서는 이 모듈과 /map 라우트가 제거되어 있다. 아래 코드는 당시 머지 버전을 기준으로 한다.**

## JS 래퍼만으로 끝나지 않았던 이유

JS 쪽에서는 latitude, longitude, level을 넘기는 뷰가 필요했지만, 실제 지도 엔진은 Swift의 KMViewContainer와 KMController가 관리했다. 앱 키를 읽는 초기화 API와 지도 뷰 등록도 네이티브 영역의 책임이었다.

```text
환경변수 → Config Plugin → Info.plist
                              ↓
JS initialize() → Swift SDK 초기화
JS View props   → Native View → 지도 카메라
```

이 경로에서 npm 패키지와 JS 래퍼를 준비하는 것만으로 SDK가 앱에 들어가지는 않는다. podspec에서 ExpoModulesCore와 KakaoMapsSDK 2.12.19 의존성을 선언하고, Expo Module 설정에 iOS 모듈을 등록했다. 해당 구성을 반영한 네이티브 개발 빌드가 필요했다.

## 키를 어디에 주입할 것인가

Config Plugin은 KAKAO_NATIVE_APP_KEY가 비어 있으면 네이티브 프로젝트 생성을 실패시켰다. 값은 Info.plist에 넣고, Swift initialize가 Bundle에서 읽었다. JS props로 앱 키를 운반하지 않도록 책임을 제한했다.

다만 환경변수를 쓴다고 클라이언트 바이너리에 포함된 앱 키가 서버 비밀키처럼 보호되는 것은 아니다. 여기서 확인할 수 있는 것은 JS 코드에 값을 직접 넣지 않고 빌드 설정에서 주입했다는 범위다. 실제 키는 이 글에 싣지 않는다.

## props 변경 때 뷰를 다시 만들지 않았다

초기화 API는 중복 초기화를 막았고 main queue에서 실행했다. 뷰는 위도·경도·줌 범위와 유한한 숫자인지를 검사했다. 생성 가능한 조건은 좌표뿐 아니라 실제 윈도우 연결과 0보다 큰 뷰 크기였다.

Swift의 핵심 조건은 다음과 같았다.

```swift
guard
  window != nil,
  bounds.width > 0,
  bounds.height > 0,
  cameraState != nil
else { return }
```

React 렌더가 일어났다는 이유만으로 엔진을 만들면 크기나 마운트 상태가 준비되지 않을 수 있다. 반대로 좌표가 바뀔 때마다 뷰를 통째로 만들면 사용자가 보고 있던 지도 상태도 버리게 된다. appliedCamera를 기억하고 새 좌표가 다를 때 기존 mapView에 moveCamera를 적용했다.

뷰가 윈도우에서 빠지면 엔진을 멈추고 정리했으며, 앱 활성/비활성 알림도 구독·해제했다. JS 컴포넌트 생명주기만으로 Native SDK의 자원을 설명할 수 없어서 UIKit 뷰와 앱 상태를 같이 봐야 했다.

## 테스트 결과를 좁혀 적기

PR에는 iOS Simulator의 실제 타일 렌더링, drag/pinch, props 전달, 실행 중 좌표 변경 때 기존 뷰를 유지한 카메라 이동이 확인되어 있다. npm run ios와 lint·타입 검사도 통과한 기록이다.

서울시청 좌표는 동작 확인용 초기값이었다. 실제 위치 수집 기능을 구현한 근거로 사용할 수 없다. 이 작업을 돌아보면 JS와 Swift 사이의 연결 자체보다, 누가 초기화하고 누가 자원을 정리하는지 정한 것이 더 큰 부분이었다.

## 참고한 변경과 코드

- [PR #10 · iOS 초기 연동과 검증 범위](https://github.com/swyp6/unstiff-app/pull/10)
- [로컬 Expo Module · 당시 머지 코드](https://github.com/swyp6/unstiff-app/tree/fbe06123335712c5ea9928a19548b89f3463bc86/modules/kakao-map)
- [Swift Native View](https://github.com/swyp6/unstiff-app/blob/fbe06123335712c5ea9928a19548b89f3463bc86/modules/kakao-map/ios/KakaoMapView.swift)
