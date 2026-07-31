---
title: "React 스터디기록"
description: "React Router의 중첩 라우팅부터 API 통신과 비동기 상태까지, 여러 페이지를 하나의 서비스로 연결하며 세운 기준을 정리했습니다."
date: "2026-07-29"
category: "Frontend"
tags:
  - "React"
  - "React Router"
  - "API"
  - "Async"
---
# React 스터디 기록: 라우팅, 컴포넌트 설계, API 처리

초기 스터디의 목적은 컴포넌트를 생성하고 화면에 렌더링하는 것이었으나, 프로젝트 규모가 커짐에 따라 단일 화면 구현보다 **화면 간의 구조와 데이터 흐름**을 제어하는 방식으로 관점이 변화했다.

---

## 라우팅 구조 설계

React Router를 활용한 SPA(Single Page Application) 라우팅은 단순히 HTML 문서를 교체하는 것이 아니라, 애플리케이션 내에서 경로에 맞는 컴포넌트를 조합하는 과정이다.

```tsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "posts", element: <PostsPage /> },
      { path: "posts/:postId", element: <PostDetailPage /> },
    ],
  },
]);

```

`RootLayout`에서 헤더와 같은 공통 레이아웃을 담당하고, 하위 경로의 컴포넌트는 `Outlet`을 통해 렌더링한다. 페이지마다 공통 요소를 중복으로 작성할 필요가 없으며, 책임이 명확히 분리된다.

라우팅 설계 기준:

* URL만으로 해당 경로가 어떤 화면인지 식별할 수 있도록 구성
* 공통 레이아웃과 개별 페이지 영역의 철저한 분리
* `errorElement`를 활용해 존재하지 않는 경로나 렌더링 오류를 서비스 UX 내에서 처리

---

## 책임 기반 컴포넌트 분리

컴포넌트는 물리적인 코드 길이가 아닌 '책임'을 기준으로 분리해야 애플리케이션의 유지보수성을 높일 수 있다. 코드를 잘게 쪼개기만 하면 데이터 전달 과정(Prop Drilling)이 복잡해지고, 너무 합치면 수정 범위를 파악하기 어렵다.

컴포넌트 분리 기준:

* 여러 페이지에서 동일한 형태와 동작으로 재사용되는가
* 하나의 독립된 사용자 상호작용(Action)을 담당하는가
* 데이터 요청(Logic)과 화면 표현(UI)을 분리하여 테스트할 수 있는가
* 컴포넌트의 이름을 지었을 때 그 책임을 한 문장으로 설명할 수 있는가

헤더, 버튼, 입력 폼 등 반복되는 UI는 공통 컴포넌트로 분리하고, 개별 페이지 컴포넌트는 데이터를 불러와 조합하는 역할만 수행하도록 설계한다. 이 기준은 `components`, `pages`, `api`, `contexts` 등 디렉터리를 나누는 아키텍처의 기준이 된다.

---

## API 통신과 상태 제어

Fetch API와 Axios의 특징을 비교하여 프로젝트 요구사항에 맞는 도구를 선택한다.

| 항목 | Fetch API | Axios |
| --- | --- | --- |
| 설치 | 브라우저 내장 (설치 불필요) | 별도 패키지 설치 |
| JSON 변환 | `response.json()` 수동 호출 | 응답 데이터 자동 변환 |
| 에러 처리 | `response.ok`로 4xx·5xx 직접 확인 | 기본적으로 예외(Error)로 처리 |
| 공통 요청 처리 | 래퍼(Wrapper) 함수 직접 구현 | 인터셉터(Interceptor) 제공 |
| 실행 환경 | 주로 브라우저 | 브라우저 및 Node.js |

단순한 데이터 요청에는 Fetch API로 충분하지만, 인증 토큰 주입, 전역 에러 핸들링, 타임아웃 등 일관된 규칙이 필요하다면 Axios 인스턴스와 인터셉터를 활용하는 것이 효율적이다.

통신 도구의 선택보다 중요한 것은 API 요청 주기에 따른 상태 분리다.

```text
idle → loading → success
             ↘ error

```

* **idle (요청 전):** 불필요한 API 호출을 방지하는 검증 로직 적용
* **loading (요청 중):** 중복 클릭 방지 및 로딩 인디케이터 노출
* **success (성공):** 수신한 데이터로 상태 업데이트 (데이터가 비어있는 경우 빈 화면 처리)
* **error (실패):** 사용자가 인지하고 다음 행동을 취할 수 있는 피드백 제공

---

## useEffect와 정리(Cleanup) 작업

이벤트 리스너 등록이나 타이머 실행 등 외부 시스템과 동기화할 때 `useEffect`를 사용한다면, 반드시 반환 함수(Return Function)를 통해 정리 작업을 명시해야 한다.

```tsx
useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);

  window.addEventListener("resize", handleResize);
  handleResize();

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);

```

정리 함수가 누락되면 컴포넌트가 언마운트되거나 의존성이 변경되어 재실행될 때, 이전 이벤트가 메모리에 그대로 남아 중복 등록되는 문제가 발생한다. `useEffect`는 단발성 실행 코드가 아니라 외부 시스템과의 연결 및 해제를 관리하는 생명주기 메서드로 접근해야 한다.

---

## 요약

React 스터디를 통해 개별 훅(Hook)의 문법을 넘어 웹 애플리케이션의 구조적 책임을 나누는 기준을 정리했다.

* **URL:** 화면의 위치와 계층 구조를 나타낸다.
* **컴포넌트:** 단일 책임을 부여하여 UI와 로직을 격리한다.
* **상태 (State):** 사용자의 상호작용과 API 비동기 흐름을 제어한다.

기능이 추가되거나 오류가 발생했을 때 구조적으로 수정 범위를 특정할 수 있는 설계 기준을 확립했다.