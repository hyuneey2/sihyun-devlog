---
title: "React 전에 HTML·CSS·JavaScript를 공부한 이유"
description: "정적 문서, 레이아웃, DOM 이벤트와 비동기 처리까지 웹의 기본 흐름을 익힌 과정이 React 개발에 어떻게 이어졌는지 정리했습니다."
date: "2026-07-29"
category: "Web"
tags:
  - HTML
  - CSS
  - JavaScript
  - DOM
---

2025년 2학년 때 HTML·CSS·JavaScript 스터디를 하며 처음부터 React를 사용하지 않고 웹의 기본 요소를 따로 공부했다. 당시에는 화면 하나를 만드는 데 더 오래 걸리는 방식처럼 느껴졌지만, 이후 React 프로젝트를 진행할수록 이 과정이 필요했다는 것을 알게 됐다.

웹 화면은 크게 구조, 표현, 동작으로 나눌 수 있다.

```text
HTML: 정보의 구조와 의미
CSS: 배치와 시각적 표현
JavaScript: 사용자 입력과 상태 변화
```

세 역할을 구분해 본 경험은 React에서도 컴포넌트의 마크업, 스타일, 상태 로직이 뒤섞이지 않게 만드는 기준이 됐다.

## HTML은 태그를 배치하는 일이 아니었다

처음에는 화면에 보이는 모양만 같으면 된다고 생각했다. 하지만 `div`만으로 구성한 화면과 의미에 맞는 요소를 사용한 화면은 브라우저와 보조 기술이 이해하는 방식이 다르다.

- 페이지의 주요 이동 영역은 `nav`
- 독립적으로 읽을 수 있는 글은 `article`
- 제목은 문서 구조에 맞는 `h1`부터 `h2`
- 동작을 실행하는 요소는 클릭 가능한 `div`가 아니라 `button`
- 입력값의 이름은 `label`과 연결

시맨틱 마크업은 보기 좋은 코드를 위한 규칙이 아니라 키보드 조작, 스크린 리더, 검색 엔진이 화면을 이해하게 하는 기반이었다. React에서 JSX를 작성할 때도 컴포넌트 이름보다 먼저 실제로 렌더링될 HTML 요소가 적절한지 확인하게 됐다.

## CSS는 위치를 맞추는 작업보다 레이아웃 규칙을 만드는 일이었다

요소를 `margin`으로 하나씩 밀어서 맞추면 한 화면에서는 원하는 위치가 나온다. 하지만 텍스트 길이나 화면 너비가 달라지면 쉽게 무너진다.

스터디에서는 레이아웃의 방향에 따라 도구를 구분했다.

| 상황 | 선택 |
| --- | --- |
| 한 방향으로 정렬 | Flexbox |
| 행과 열을 함께 설계 | Grid |
| 콘텐츠 너비 제한 | `max-width`와 자동 여백 |
| 화면 크기에 따른 변경 | 미디어 쿼리 |
| 요소 자체를 기준으로 배치 | 일반 흐름과 상대 위치 |

예를 들어 카드 목록은 고정 너비를 여러 번 작성하는 대신 다음처럼 최소 너비와 남는 공간의 분배 규칙을 정할 수 있다.

```css
.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}
```

중요한 것은 특정 해상도에서만 맞는 숫자가 아니라, 콘텐츠가 늘거나 줄어도 유지되는 규칙을 만드는 것이었다.

## JavaScript로 화면이 변하는 원리를 직접 확인했다

React에서는 상태가 바뀌면 화면이 다시 렌더링된다. 그 전에 DOM을 직접 선택하고 이벤트를 연결해 보니, 브라우저에서 어떤 일이 일어나는지 더 구체적으로 이해할 수 있었다.

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

이 짧은 코드에도 사용자 입력 읽기, 기본 동작 차단, 데이터 반영, DOM 갱신이 모두 들어 있다. 기능이 커질수록 여러 위치에서 DOM을 직접 바꾸는 방식은 현재 상태를 추적하기 어려워졌다. React의 선언적 렌더링이 왜 필요한지 자연스럽게 이해할 수 있었던 지점이다.

## 비동기 처리는 로딩과 실패까지 포함한다

JavaScript에서 API 요청을 공부하며 `async`와 `await`은 단순히 Promise를 편하게 쓰는 문법이 아니라는 점도 배웠다. 서버 응답을 기다리는 동안 화면은 계속 동작하고, 요청은 성공할 수도 실패할 수도 있다.

```javascript
async function loadPosts() {
  try {
    setMessage("불러오는 중...");

    const response = await fetch("/api/posts");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const posts = await response.json();
    renderPosts(posts);
  } catch (error) {
    setMessage("글을 불러오지 못했습니다.");
  }
}
```

`fetch`는 404나 500 응답만으로 Promise를 거부하지 않으므로 `response.ok`를 직접 확인해야 한다. 요청 코드만 작성하고 끝내는 것이 아니라 로딩, 성공, 빈 결과, 실패 상태를 각각 사용자에게 어떻게 보여 줄지도 함께 설계해야 했다.

## React를 배운 뒤에도 기본기는 사라지지 않았다

React는 HTML·CSS·JavaScript를 대체하지 않는다. JSX는 결국 HTML로 렌더링되고, CSS 레이아웃 규칙은 그대로 적용되며, 상태와 이벤트 역시 JavaScript로 동작한다.

기본기를 따로 공부한 뒤에는 오류가 생겼을 때 원인을 더 잘 나눌 수 있었다.

- 구조와 접근성 문제인지
- CSS의 크기·정렬·우선순위 문제인지
- 이벤트와 상태 변경 문제인지
- 비동기 요청과 응답 처리 문제인지

React 문법을 먼저 외우는 것보다 브라우저가 문서를 만들고, 스타일을 계산하고, 이벤트에 반응하는 흐름을 이해한 것이 이후 프로젝트에서 더 오래 남았다.
