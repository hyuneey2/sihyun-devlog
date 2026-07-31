---
title: "HTML·CSS·JavaScript"
description: "정적 문서, 레이아웃, DOM 이벤트와 비동기 처리까지 웹의 기본 흐름을 익힌 과정이 React 개발에 어떻게 이어졌는지 정리했습니다."
date: "2026-07-29"
category: "Frontend"
tags:
  - "HTML"
  - "CSS"
  - "JavaScript"
  - "DOM"
---
# HTML·CSS·JavaScript 스터디 기록

HTML, CSS, JavaScript의 기본 구조와 동작 원리를 정리한 기록이다. 각 기술의 역할을 다음과 같이 구분하여 학습했다.

```text
HTML: 문서의 구조와 의미
CSS: 레이아웃과 시각적 표현
JavaScript: 사용자 입력 처리 및 DOM 조작

```

---

## HTML

화면 요소의 모양이 아닌 문맥에 맞는 태그(시맨틱 태그)를 사용하는 것이 핵심이다.

* `nav`: 주요 이동 경로
* `article`: 독립적인 콘텐츠
* `h1`~`h6`: 문서의 계층 구조
* `button`: 동작 실행
* `label`: 입력 요소 설명 및 `input` 연결

`div` 태그만으로도 배치가 가능하지만, 검색 엔진과 보조 기술이 문서 구조를 해석하려면 적절한 의미의 태그를 써야 한다.

---

## CSS

요소의 고정 위치를 지정하기보다 유연한 레이아웃 규칙을 설정한다.

* 한 방향 정렬: `Flexbox`
* 행과 열 구성: `Grid`
* 너비 제한: `max-width`
* 화면 크기 대응: 미디어 쿼리
* 요소 간 간격: `gap`

`margin`으로 위치를 고정하면 화면 크기나 콘텐츠 변화 시 레이아웃이 깨진다. `grid`와 `minmax`를 사용하면 화면 크기에 맞추어 열 개수가 조절된다.

```css
.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

```

---

## JavaScript

DOM 선택, 이벤트 등록, 상태 변경 흐름을 작성했다.

```javascript
const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const item = document.createElement("li");
  item.textContent = input.value;

  list.append(item);
  input.value = "";
});

```

동작 순서:

1. HTML 요소 선택
2. 이벤트 등록
3. 입력값 확인
4. DOM 요소 생성
5. 화면 반영

기능이 늘어날수록 직접적인 DOM 조작은 현재 상태 추적을 어렵게 만든다.

---

## 비동기 처리

API 요청 시 데이터 수신 외에 예외 처리와 상태 구분이 필요하다.

```javascript
async function loadPosts() {
  try {
    setMessage("불러오는 중입니다.");

    const response = await fetch("/api/posts");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const posts = await response.json();
    renderPosts(posts);
  } catch {
    setMessage("글을 불러오지 못했습니다.");
  }
}

```

`fetch` 함수는 404나 500 등 HTTP 에러 응답에서 자동으로 에러를 발생시키지 않는다. 따라서 `response.ok` 조건을 직접 확인해 예외 처리를 해야 한다.

화면 구현 시 다뤄야 하는 4가지 상태:

* 로딩 중
* 요청 성공
* 데이터 없음
* 요청 실패

---

## 요약

웹 화면 구성 및 동작 문제는 다음 기준에 따라 파악한다.

* 마크업 및 접근성 문제: HTML
* 스타일 및 반응형 레이아웃 문제: CSS
* 이벤트, DOM 조작, 비동기 상태 문제: JavaScript