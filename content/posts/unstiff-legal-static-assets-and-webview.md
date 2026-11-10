---
title: "앱 안의 약관을 정적 사이트로 분리하고 URL 계약을 다시 맞췄다"
description: "초기 Cloudflare 정적 약관 배포에서 팀 공용 리소스·서버 contentUrl·앱 WebView로 이어진 변경을 구분해 정리했습니다."
date: "2026-11-10"
category: "Frontend"
tags: ["Unstiff","Cloudflare","WebView","Static Assets"]
series: "Unstiff 개발기"
seriesOrder: 4
---

2026년 9월 PR #41에서 앱에 하드코딩된 약관을 정적 웹페이지로 분리했다. 약관 문구 하나를 바꾸려고 앱 화면 코드를 고치고 바이너리를 다시 배포하는 결합을 줄이는 작업이었다. 이후 팀 공용 static 저장소로 관리 위치가 바뀌고 WebView가 도입되어, 최초 구현과 현재 주소를 나눠 봐야 전체 구조를 이해할 수 있다.

## 처음에는 앱 저장소 안에 작은 정적 사이트를 뒀다

초기 legal/은 Eleventy와 Tailwind로 구성했다. 공통 레이아웃과 앱의 디자인 토큰을 재사용하고, 빌드한 파일을 Cloudflare Workers Static Assets로 제공했다. 설정 화면에서는 기존 expo-web-browser를 사용해 외부 문서를 열었다. 당시에는 WebView를 새로 도입하지 않았다.

```text
legal Markdown → 정적 HTML/CSS → Workers Static Assets
앱 설정       → 배포 URL 열기
온보딩        → 서버 Term.contentUrl 열기
```

앱과 문서의 배포 단위가 갈라져 문서 내용만 바뀔 때는 웹을 다시 배포하면 된다. 다만 앱의 동의 항목, 약관 타입, 화면 정책까지 바뀌는 경우에는 앱과 서버의 변경도 별도다. '웹으로 옮기면 모든 약관 변경에 앱 배포가 필요 없다'는 뜻은 아니다.

## 팀 공용 리소스로 옮긴 뒤 무엇이 기준인가

#114에서는 중복 legal 소스를 제거하고 unstiff-static의 팀 공용 리소스를 기준으로 정리했다. 개인 계정의 초기 주소와 팀 계정 주소가 다르므로 배포 권한과 URL 변경을 같이 관리해야 했다. 현재 계정의 실제 관리자 권한까지 확인한 것은 아니며, PR과 코드로 확인한 범위는 관리 위치와 주소의 전환이다.

| 시점 | 코드에 기록된 문서 주소 |
| --- | --- |
| #41 초기 | unstiff-legal.unstiff.workers.dev/terms/ 등 |
| #165 이후 | terms.swyp-8team.workers.dev/service.html 등 |

2026-11-10 읽기 전용 요청으로 현재 service.html과 privacy-policy.html이 문서 HTML을 반환하는 것을 확인했다. 이것이 서버 GET /terms의 현재 응답 URL까지 확인했다는 뜻은 아니다. 서버 약관 URL의 실제 운영 설정은 별도 계약이다.

## 문서와 동의 항목을 같은 배열로 만들지 않았다

온보딩에서는 PRIVACY, SERVICE, SENSITIVE만 허용하고 EXTERNAL_AI는 제외했다. 서버가 미래에 새 약관을 추가하더라도 사용자가 보지 않은 항목까지 전체 동의와 POST 대상에 섞이면 안 된다. 표시·정렬 정책과 실제 id, required, agreed는 구분했다.

#120에서 온보딩도 내부 WebView로 통일했다. 라우트에는 문서 type만 전달하고, 상세 화면이 GET /terms의 contentUrl을 다시 찾는다. 주소를 navigation param에 복사하면 오래된 URL이 화면 상태에 남기 쉽다. 상세는 읽기 전용이며, 체크 상태는 push로 남아 있는 약관 목록이 유지한다.

현재 WebView는 로딩·오류·외부 링크 처리를 공통화한다. undefined는 조회 전, null은 열 수 없는 문서라는 식으로 요청 상태와 부재를 구분하는 상세 화면도 확인할 수 있다.

## 개인정보 동의서와 처리방침을 나눈 이유

#165의 PRIVACY 예외는 이름만 보면 놓치기 쉽다. 회원가입에서 서버가 내려주는 privacy.html은 개인정보 수집·이용 동의서다. 설정의 개인정보 처리방침은 privacy-policy.html을 직접 연다. 고객 지원 support.html은 약관 타입도 동의 대상도 아니어서 전용 화면으로 분리했다.

초기 #41은 정적 문서 4종의 로컬·배포 접근을 확인했지만 iOS 런타임 최종 확인은 기존 빌드 문제로 남겼다. 후속 #120은 iOS WebView와 뒤로가기 동의 상태를, #165는 처리방침·지원 페이지 연결을 확인했다. 과거 배포 기록을 이번 블로그 작업에서 새로 운영 배포한 결과로 표현하지 않는다.

## 참고한 변경과 코드

- [PR #41 · 최초 정적 사이트 분리](https://github.com/swyp6/unstiff-app/pull/41)
- [PR #114 · 팀 static으로 정리](https://github.com/swyp6/unstiff-app/pull/114)
- [PR #120 · 온보딩 WebView](https://github.com/swyp6/unstiff-app/pull/120)
- [PR #165 · 문서별 URL 구분](https://github.com/swyp6/unstiff-app/pull/165)
- [현재 약관 URL 계약](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/constants/legal-urls.ts)
- [공용 WebView](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/features/legal/components/legal-document-webview.tsx)
- [현재 서비스 약관](https://terms.swyp-8team.workers.dev/service.html)
- [현재 개인정보 처리방침](https://terms.swyp-8team.workers.dev/privacy-policy.html)
