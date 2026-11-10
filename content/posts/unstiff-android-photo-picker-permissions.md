---
title: "Photo Picker로 바꾸고도 최종 Manifest를 확인한 이유"
description: "라이브러리가 추가하는 미디어 권한을 줄이고, 사진 선택 요구사항과 빌드 결과·심사 확인을 분리했습니다."
date: "2026-11-10"
category: "Frontend"
tags: ["Unstiff","Android","Expo","Photo Picker","Permissions"]
series: "Unstiff 개발기"
seriesOrder: 10
---

2026년 9월 PR #202는 Google Play 사진·동영상 권한 대응 작업이었다. 앱이 필요한 것은 사용자가 고른 프로필 사진 한 장이었는데, expo-media-library를 포함한 네이티브 빌드에는 더 넓은 미디어 권한이 들어갈 수 있었다. 화면 코드에서 권한 요청을 지우는 것과 설치될 앱이 선언하는 권한을 줄이는 것은 다른 변경이었다.

## 사용자 요구와 라이브러리 기본값을 구분했다

프로필 사진 선택을 위해 전체 앨범을 읽을 필요가 있는지 먼저 봤다. Android 13 이상에서는 기존 자체 앨범 그리드로 들어가지 않고 시스템 Photo Picker를 여는 분기를 넣었다. 선택한 항목을 앱에 전달하는 방식이므로 전체 라이브러리 접근과 요구 범위가 다르다.

Android 공식 문서도 Photo Picker를 선택된 이미지·영상에 접근하도록 하는 시스템 UI로 설명한다. 지원 여부는 OS·시스템 업데이트·backport 조건에 따라 달라질 수 있다. 이 프로젝트의 'Android 13 이상에서 분기'를 Photo Picker 자체가 오직 Android 13부터만 존재한다는 설명으로 일반화하면 안 된다.

## JS 변경과 네이티브 선언을 함께 수정했다

#202는 app.config.ts의 expo-media-library 설정에 granularPermissions: []를 넣었다. android.blockedPermissions에는 다음 선언들을 포함했다.

```text
READ_MEDIA_IMAGES
READ_MEDIA_VIDEO
READ_MEDIA_AUDIO
READ_MEDIA_VISUAL_USER_SELECTED
```

라이브러리가 기본값으로 추가하는 선언과 앱이 실제로 요청하는 권한을 모두 확인해야 했다. Expo Config Plugin을 거쳐 네이티브 프로젝트가 만들어지고 여러 Manifest가 merge되므로, 설정 파일 하나의 의도만으로 최종 결과를 단정할 수 없다.

expo-media-library 자체를 제거하지는 않았다. Android 12 이하/iOS의 기존 자체 앨범 경로와 운동 사진을 앨범에 저장하는 기능에 여전히 쓰였다. 모든 플랫폼을 한 번에 바꾸면 이번 권한 대응과 별개인 동작까지 달라진다.

## 최종 검증 대상은 merged manifest였다

당시 fresh prebuild의 release merged manifest에서 위 네 권한이 제외되고 CAMERA가 유지되는 것을 확인했다. 네이티브 설정을 바꾼 뒤 기존 개발 바이너리로 JS만 reload하는 것은 이 변경을 확인하는 방법이 아니다.

확인 지점을 다음처럼 나눴다.

1. Android 13 이상 선택 경로가 시스템 picker로 이어지는가.
2. 낮은 Android와 iOS의 기존 분기가 유지되는가.
3. 새 네이티브 생성·merge 결과에 불필요한 권한이 없는가.
4. 실제 설치한 빌드의 권한·취소·선택 흐름은 의도대로인가.
5. 제출한 AAB에 대해 Play Console의 선언 요구가 어떻게 표시되는가.

#202에서 1~3은 코드·정적 검사와 manifest로 확인했고, 런타임 테스트와 새 AAB의 Play Console 최종 확인은 하지 못했다. 따라서 심사를 통과했다거나 모든 Android 기기에서 검증했다고 쓰지 않는다.

정책 설명은 PR 당시의 대응 배경과 현재 공식 Photo Picker의 동작을 분리했다. 특정 권한 목록을 지우면 언제나 심사 요건을 충족한다는 안내가 아니라, 필요한 접근 범위를 좁히고 실제 빌드 산출물을 확인한 사례다.

## 참고한 변경과 코드

- [PR #202 · 당시 변경과 미검증 항목](https://github.com/swyp6/unstiff-app/pull/202)
- [네이티브 설정](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/app.config.ts)
- [온보딩 사진 선택 분기](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/app/profile-photo.tsx)
- [Android 공식 Photo Picker 문서](https://developer.android.com/training/data-storage/shared/photo-picker)
