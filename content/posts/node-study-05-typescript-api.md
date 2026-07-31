---
title: "TypeScript로 API 프로젝트 시작하기"
description: "GitHub 이슈와 브랜치, Postman 테스트 흐름을 준비하고 TypeScript·Express로 회원가입 API를 계층별로 구현했습니다."
date: "2026-07-31"
category: "Backend"
series: "Node.js 스터디"
seriesOrder: 5
tags:
  - "Node.js"
  - "TypeScript"
  - "Express"
  - "Postman"
---

프로젝트 구조를 정한 뒤 TypeScript와 Express로 첫 API를 구현했다. 코드를 작성하는 것뿐 아니라 이슈와 브랜치로 작업 단위를 나누고, Postman으로 요청과 응답을 확인하는 개발 흐름도 함께 만들었다.

## 이슈에서 작업 범위를 먼저 정하기

기능을 바로 구현하기 전에 GitHub Issue에 작업 목적과 범위를 적었다.

```text
What & Why
Scope
How
Todo
Test Plan
```

회원가입 기능이라면 입력 DTO, Service 규칙, Repository 저장, 응답 형식과 예외 처리가 모두 작업 범위가 된다. 이슈 번호를 브랜치와 PR에 연결하면 코드 변경이 어떤 요구사항에서 시작됐는지 추적하기 쉬워진다.

```bash
git switch -c feature/signup
```

작은 프로젝트에서도 브랜치를 나누는 이유는 형식 때문이 아니라, 하나의 작업에 필요한 변경만 모아 검토하기 위해서다.

## Postman으로 API를 독립적으로 확인하기

프론트엔드가 완성되지 않아도 Postman을 사용하면 서버 API를 직접 호출할 수 있다.

- Params: Query String 입력
- Authorization: 인증 방식과 토큰 설정
- Headers: Content-Type 등 요청 정보 설정
- Body: JSON 요청 데이터 입력
- Scripts: 요청 전후 자동 처리

```json
{
  "email": "test@example.com",
  "password": "example-password",
  "name": "홍길동"
}
```

브라우저 화면과 분리해 테스트하면 오류가 프론트엔드 요청 코드에서 발생한 것인지 서버 로직에서 발생한 것인지 먼저 구분할 수 있다.

## TypeScript 프로젝트 설정

Express와 데이터베이스 연결에 필요한 라이브러리를 설치하고 TypeScript 설정을 추가했다.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

`strict` 옵션은 암묵적으로 `any`가 퍼지는 것을 막고, `noUncheckedIndexedAccess`는 배열이나 객체에서 가져온 값이 없을 가능성을 확인하게 한다.

개발 서버는 TypeScript 파일을 실행하고 변경 시 재시작하도록 구성했다.

```json
{
  "scripts": {
    "dev": "nodemon --exec tsx src/index.ts"
  }
}
```

## 데이터베이스 연결은 Pool로 관리한다

요청마다 새 연결을 만드는 대신 Connection Pool을 두고 필요한 동안 연결을 빌려 사용했다.

```ts
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});
```

Pool은 연결 생성 비용을 줄이고 동시에 들어오는 요청을 제한된 연결 안에서 처리한다. 환경 변수 누락이나 연결 실패도 서버 시작 단계에서 확인할 수 있게 했다.

## 회원가입 요청 흐름

첫 API는 회원가입이었다.

```text
POST /api/auth/signup
→ Controller
→ Service
→ Repository
→ Database
```

### Controller

Controller는 HTTP 요청과 응답만 담당한다.

```ts
export async function signupController(req, res, next) {
  try {
    const result = await signupService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}
```

### Service

Service에서는 회원가입 규칙을 처리한다.

```ts
export async function signupService(input: UserSignupRequest) {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new Error("이미 가입된 이메일입니다.");
  }

  const userId = await createUser(input);
  return { userId, email: input.email, name: input.name };
}
```

### Repository

Repository는 SQL 실행에 집중한다. 사용자 입력값을 문자열로 이어 붙이지 않고 파라미터 바인딩을 사용한다.

```ts
export async function createUser(input: UserSignupRequest) {
  const [result] = await pool.execute(
    `INSERT INTO user (email, password, name)
     VALUES (?, ?, ?)`,
    [input.email, input.password, input.name],
  );

  return result.insertId;
}
```

## 비동기 오류를 한곳으로 전달하기

데이터베이스 조회와 저장은 모두 비동기 작업이다. `try/catch`로 오류를 잡되 각 Controller가 서로 다른 응답을 직접 만들지 않고 `next(error)`로 공통 오류 처리 흐름에 전달했다.

이 단계에서는 아직 오류 타입을 세분화하지 않았지만, Controller가 정상 응답에 집중하고 오류 처리는 별도 미들웨어로 이동할 수 있는 구조를 만들었다.

## 테이블이 없다는 오류에서 확인한 것

Repository 코드를 작성한 뒤 요청을 보내자 테이블을 찾을 수 없다는 오류가 발생했다. 코드나 SQL 문법만 확인했지만 실제 원인은 현재 연결한 데이터베이스에 `user` 테이블이 생성되지 않은 것이었다.

오류를 해결하며 다음 순서로 확인하는 습관을 정리했다.

1. 환경 변수가 의도한 데이터베이스를 가리키는지 확인한다.
2. 연결 자체가 성공했는지 확인한다.
3. 대상 테이블과 컬럼이 실제로 존재하는지 확인한다.
4. 그다음 SQL과 서비스 코드를 확인한다.

API 구현은 Controller 파일 하나를 만드는 일이 아니었다. 작업 범위를 기록하고, 실행 환경과 데이터베이스를 준비한 뒤, 각 계층의 책임에 맞게 요청이 이동하도록 연결하는 전체 과정이었다.
