---
title: "온보딩 상태를 초기화했더니 로그인 화면으로 돌아갔다"
description: "신규 회원 분기, 닉네임 검증, 프로필 저장과 화면 가드의 생명주기를 연결하며 임시 상태와 서버 상태를 구분했습니다."
date: "2026-11-10"
category: "Frontend"
tags: ["Unstiff","Zustand","Expo Router","Authentication"]
series: "Unstiff 개발기"
seriesOrder: 3
---

2026년 9월 회원가입을 약관 → 닉네임 → 사진 → 완료 → 홈으로 연결했다. PR #56에서는 가입 완료 때 임시 store를 비우자 이전 화면의 가드가 다시 실행되어 로그인으로 돌아가는 문제가 있었다. 토큰이 사라진 것으로 의심하기 쉬운 흐름이지만, 현재 signup-complete의 주석과 PR 기록은 인증 store가 아닌 화면 가드 사이의 라우팅 충돌을 원인으로 남기고 있다.

## 회원가입 단계와 회원 상태를 구분했다

SNS 로그인 응답의 newUser로 신규 사용자 진입을 분기했다. signup-store는 한 번의 가입 과정에서 필요한 값을 메모리에 보관한다. 앱 재시작 후까지 이 값을 유지하면 같은 기기의 다른 로그인에도 이전 가입 상태가 섞일 수 있으므로 persist를 쓰지 않았다.

사진 URI가 null이라는 조건만으로 단계를 판정할 수도 없었다. 사진을 건너뛴 사용자와 아직 사진 화면에 도착하지 않은 사용자가 둘 다 null이기 때문이다. hasCompletedProfileStep를 별도로 두었다. hasAgreedToRequiredTerms 역시 이번 화면 흐름의 순서를 위한 값이며, 실제 동의 상태의 기준은 서버다.

```text
서버: 필수 약관 동의 / 프로필 nickname / profileImageUrl
임시 store: 이번 가입의 단계 / 닉네임 입력 / 확정한 로컬 사진
```

## reset과 replace의 순서만 바꿔서는 부족했다

가입을 끝내며 store를 reset하면 구독 중인 이전 화면도 새 상태를 본다. router.replace가 호출된 순간 모든 이전 컴포넌트가 동기적으로 사라지는 것은 아니다. 그 사이 '신규 사용자가 아니면 /login'이라는 가드가 재실행되면 홈 이동과 경쟁한다.

완료 화면의 진입 순서 검사는 최초 마운트 때 getState로 읽도록 제한했다. 다른 사용자 상태를 계속 감시하는 전역 인증 가드와, 이미 진입한 가입 화면의 단계 검사는 목적이 다르기 때문이다. 이 방식은 이후의 임시 상태 초기화를 새 진입으로 오해하지 않게 한다.

반면 앱 reload 뒤에는 메모리 store만 검사해서는 안 된다. #120은 필수 약관 동의와 서버 nickname을 조회해, 동의가 끝났는데 nickname이 null인 사용자의 가입 상태를 복구하고 /nickname으로 보냈다. 기존 사용자가 새 필수 약관에 재동의하는 경우는 nickname이 있으므로 홈으로 간다. store 주석 일부에는 재시작 복구가 미해결이라고 남아 있지만, 이 글의 재진입 동작은 후속 #120과 실제 진입 가드 변경을 기준으로 구분했다.

## 닉네임 확인과 저장은 다른 요청이다

#56의 개발 전용 닉네임 우회는 #71에서 서버 중복 확인 API로 교체됐다. 현재 useNicknameAvailability는 400ms debounce와 요청 세대를 사용한다. 같은 문자열로 돌아와도 이전 결과를 재사용하지 않는 것이 핵심이다.

```text
foo 확인 성공 → bar 입력 → 다시 foo 입력
                  새 입력마다 generation 증가
이전 foo의 성공 ≠ 이번 foo의 확인 완료
```

최종 저장 시점에는 다른 사용자가 그 닉네임을 선점했을 수 있다. 그래서 화면의 available 상태만 믿지 않고 서버 저장 오류도 처리한다. 가입 완료 화면은 사진 업로드의 secure URL을 얻은 뒤 프로필을 저장하고, 닉네임 충돌이면 입력 화면으로 돌아간다. 업로드가 성공한 같은 사진의 URL은 재시도에 재사용한다. 사진을 건너뛰어도 nickname 저장은 가능하다.

## 검증된 것과 남은 것

#56은 iOS 시뮬레이터 Apple 신규 계정의 전체 플로우와 사진 취소·재선택을 확인했다. #71은 서버 프로필 저장·재로그인 복원을 확인했다. #120의 약관 WebView와 뒤로가기 상태 유지는 iOS 확인 기록이 있지만, reload 후 nickname null 재진입은 코드·정적 검증이며 별도 실기기 테스트는 없었다.

현재 가입 완료 CTA는 isSubmitting으로 진행 중 입력을 막는다. 운동 기록에서 사용한 성공 잠금과 같은 강도의 동기 ref 잠금이 모든 온보딩 제출에 적용됐다고 확대해서 설명하지 않는다. 각 화면이 실제로 가진 보호 범위를 확인하는 것이 필요했다.

## 참고한 변경과 코드

- [PR #56 · 가입 플로우와 가드 충돌](https://github.com/swyp6/unstiff-app/pull/56)
- [PR #71 · 프로필 저장·닉네임 API](https://github.com/swyp6/unstiff-app/pull/71)
- [PR #114 · 약관 노출 정책](https://github.com/swyp6/unstiff-app/pull/114)
- [PR #120 · 서버 기준 재진입](https://github.com/swyp6/unstiff-app/pull/120)
- [가입 완료 저장과 가드](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/app/signup-complete.tsx)
- [닉네임 요청 세대 처리](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/features/auth/use-nickname-availability.ts)
- [메모리 가입 store](https://github.com/swyp6/unstiff-app/blob/265c574ad0762df0489ae550c9c9ef6803db2b1a/src/store/signup-store.ts)
