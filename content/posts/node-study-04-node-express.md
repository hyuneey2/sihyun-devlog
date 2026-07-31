---
title: "Node.js와 Express 기초"
description: "Node.js의 이벤트 루프와 비동기 처리 방식을 이해하고 TypeScript·Express 프로젝트를 역할별 계층으로 나누는 기준을 정리했습니다."
date: "2026-07-31"
category: "Backend"
series: "Node.js 스터디"
seriesOrder: 4
tags:
  - "Node.js"
  - "Express"
  - "TypeScript"
  - "Architecture"
---

API 설계를 마친 뒤 실제 서버를 만들기 위해 Node.js와 TypeScript, Express의 역할을 정리했다. 라이브러리 사용법을 외우기보다 자바스크립트 코드가 서버에서 어떻게 실행되고, 프로젝트 파일을 왜 역할별로 나누는지 이해하는 데 집중했다.

## Node.js는 자바스크립트 런타임이다

Node.js는 브라우저 밖에서 자바스크립트를 실행할 수 있게 하는 런타임이다. V8 엔진이 자바스크립트 코드를 실행하고, libuv가 파일과 네트워크 같은 비동기 I/O와 이벤트 루프를 지원한다.

```text
JavaScript
→ V8
→ Node.js API
→ libuv / OS
```

브라우저에서는 DOM과 사용자 이벤트를 다루지만, Node.js에서는 파일 시스템과 네트워크, 프로세스 같은 서버 환경의 기능을 사용할 수 있다.

## 싱글 스레드와 논블로킹 I/O

Node.js에서 자바스크립트 코드를 실행하는 메인 스레드는 하나다. 그렇다고 모든 작업을 하나씩 끝날 때까지 기다리는 것은 아니다.

파일 읽기, 데이터베이스 조회, 네트워크 통신처럼 시간이 걸리는 I/O 작업은 백그라운드에 맡기고 메인 스레드는 다음 코드를 실행한다. 작업이 끝나면 콜백이나 Promise가 실행 대기열에 들어가고 이벤트 루프가 처리 순서를 조정한다.

```ts
const user = await userRepository.findById(userId);
return user;
```

`await`는 코드가 동기적으로 보이게 만들지만 전체 서버를 멈추는 것이 아니라 해당 비동기 함수의 다음 실행을 기다린다.

이 구조는 요청과 응답이 많은 API 서버에 잘 맞는다. 반면 복잡한 수치 계산이나 영상 인코딩처럼 CPU를 오래 점유하는 작업은 메인 스레드를 막을 수 있으므로 Worker Thread나 별도 서비스가 필요할 수 있다.

## TypeScript를 사용하는 이유

JavaScript는 값의 타입이 실행 중에 정해진다. 작은 코드에서는 유연하지만 프로젝트가 커지면 함수가 어떤 값을 받고 반환하는지 추적하기 어려워진다.

TypeScript는 변수, 함수, 객체의 구조를 타입으로 표현하고 실행 전에 오류를 확인한다.

```ts
type CreateUserInput = {
  email: string;
  password: string;
  name: string;
};

function createUser(input: CreateUserInput): Promise<number> {
  // ...
}
```

타입은 단순히 오류에 빨간 줄을 표시하는 도구가 아니었다. 계층 사이에 어떤 데이터가 이동하는지 명시하고, 변경 시 영향을 받는 코드를 빠르게 찾게 해주는 문서 역할도 했다.

## ES Module로 파일 연결하기

프로젝트에서는 `import`와 `export`를 사용하는 ES Module 방식을 사용했다.

```ts
export function signup() {
  // ...
}
```

```ts
import { signup } from "./user.service";
```

파일 단위로 책임을 나누려면 각 모듈이 무엇을 공개하고 무엇을 내부에 숨길지 정해야 한다. 모든 함수를 한 파일에 두는 것보다 계층별 공개 범위를 제한하면 코드의 의존 관계가 분명해진다.

## Controller, Service, Repository

Express 프로젝트의 요청 흐름을 다음처럼 나눴다.

```text
Route
→ Controller
→ Service
→ Repository
→ Database
```

| 계층 | 책임 |
| --- | --- |
| Route | URL과 HTTP 메서드를 Controller에 연결 |
| Controller | 요청값을 받고 HTTP 응답을 결정 |
| Service | 서비스 규칙과 처리 순서를 담당 |
| Repository | 데이터베이스 쿼리와 저장을 담당 |

회원가입을 예로 들면 Controller는 Request Body를 받고, Service는 이메일 중복 확인과 비밀번호 처리 순서를 결정하며, Repository는 실제 SQL을 실행한다.

모든 코드를 Controller에 작성해도 기능은 동작한다. 하지만 입력 형식, 서비스 규칙, SQL은 서로 다른 이유로 바뀐다. 변경 이유가 다른 코드를 분리하는 것이 계층 구조의 목적이었다.

## DTO로 전달 데이터 제한하기

DTO는 계층 사이 또는 클라이언트와 서버 사이에서 전달할 데이터 구조를 정의한다.

```ts
type UserSignupRequest = {
  email: string;
  password: string;
  name: string;
};

type UserSignupResponse = {
  userId: number;
  email: string;
  name: string;
};
```

요청 DTO는 필수값과 형식을 확인하는 기준이 되고, 응답 DTO는 비밀번호처럼 외부에 노출하면 안 되는 값을 제외하는 경계가 된다.

## 환경 변수로 설정 분리하기

포트, 데이터베이스 접속 정보, JWT 비밀 키는 코드에 직접 작성하지 않고 환경 변수로 분리해야 한다.

```env
PORT=3000
DB_HOST=localhost
DB_NAME=example
```

`.env` 파일은 저장소에 올리지 않고 `.gitignore`에 포함한다. 설정값을 숨기는 것뿐 아니라 개발·테스트·운영 환경이 서로 다른 값을 주입할 수 있게 만드는 목적도 있다.

이번 단계에서 서버 프로젝트의 기본 기준이 정리됐다. Node.js의 비동기 실행 모델을 이해하고, TypeScript로 데이터 경계를 표현하며, Express 요청 흐름을 변경 이유에 따라 나누는 것이 이후 기능 구현의 기반이 됐다.
