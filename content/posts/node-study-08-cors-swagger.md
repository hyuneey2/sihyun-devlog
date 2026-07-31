---
title: "CORS와 Swagger로 프론트엔드 연동하기"
description: "브라우저의 SOP와 Preflight 동작을 기준으로 CORS 오류를 해결하고 TSOA로 실제 타입과 일치하는 Swagger 문서를 생성했습니다."
date: "2026-07-31"
category: "Backend"
series: "Node.js 스터디"
seriesOrder: 8
tags:
  - "Node.js"
  - "CORS"
  - "Swagger"
  - "OpenAPI"
---

Postman에서는 정상 동작하던 API가 브라우저에서 호출하자 CORS 오류로 막혔다. 서버 코드의 성공 여부와 브라우저의 보안 정책은 별개의 문제였다. 요청이 어떤 조건에서 Preflight를 거치고, 서버가 어떤 응답 헤더를 보내야 하는지부터 확인했다.

## Origin과 동일 출처 정책

Origin은 URL의 Protocol, Host, Port 조합이다.

```text
http://localhost:3000
http://localhost:8080
```

두 주소는 Port가 다르므로 서로 다른 Origin이다.

브라우저는 기본적으로 다른 Origin의 응답을 자바스크립트가 읽지 못하게 하는 동일 출처 정책(SOP)을 적용한다. CORS는 서버가 허용할 Origin과 요청 조건을 응답 헤더로 알려 이 제한을 선택적으로 완화하는 방식이다.

## Preflight가 먼저 발생하는 경우

브라우저는 실제 요청을 보내기 전에 `OPTIONS` 요청으로 서버의 허용 범위를 확인할 수 있다.

```http
OPTIONS /api/auth/signup
Origin: http://localhost:3000
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type
```

서버가 Origin과 메서드, Header를 허용한다는 응답을 보내면 실제 요청이 이어진다.

```http
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET,POST,PATCH,DELETE
Access-Control-Allow-Headers: Content-Type,Authorization
```

Preflight 자체가 실패하면 Controller의 API 로직까지 요청이 도달하지 않는다.

## Express CORS 설정

개발 중 모든 Origin을 허용하는 설정은 간단하지만 운영에서는 실제 프론트엔드 주소를 명시하는 편이 안전하다.

```ts
import cors from "cors";

app.use(
  cors({
    origin: ["http://localhost:3000", "https://example.com"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
```

Cookie를 포함하는 요청에서는 `credentials: true`와 정확한 Origin이 함께 필요하다. `Access-Control-Allow-Origin: *`와 Credential 요청은 같이 사용할 수 없다.

## 자주 만난 CORS 오류

### Allow-Origin Header가 없는 경우

백엔드의 허용 Origin 목록에 현재 프론트엔드 주소가 있는지 확인한다. `localhost`라도 Port가 다르면 다른 Origin이다.

### Request Header가 허용되지 않은 경우

프론트엔드가 `Authorization` 같은 Header를 보내는데 서버의 `allowedHeaders`에 없다면 Preflight가 실패한다.

### Cookie 요청과 Wildcard가 충돌하는 경우

프론트엔드가 `credentials: "include"`로 요청할 때 서버는 `*`가 아니라 정확한 Origin을 반환해야 한다.

`mode: "no-cors"`는 일반적인 해결책이 아니다. 브라우저가 응답 내용을 읽을 수 없는 Opaque Response가 되기 때문에 API 연동에서는 서버 설정을 바로잡아야 한다.

## 브라우저에서 직접 API 호출하기

간단한 HTML과 `fetch`로 회원가입 API를 호출해 브라우저에서만 발생하는 조건을 확인했다.

```ts
const response = await fetch(`${API_URL}/api/auth/signup`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(formData),
});

const result = await response.json();

if (!response.ok) {
  throw result;
}
```

7주차에 통일한 Error Code와 메시지를 프론트엔드가 그대로 분기할 수 있었다. 이 실습을 통해 백엔드 오류 응답의 일관성이 실제 화면의 안내 문구로 이어진다는 점을 확인했다.

## OpenAPI와 Swagger

OpenAPI는 Endpoint와 파라미터, Request Body, Response, 인증 방식을 기술하는 표준 명세다. Swagger UI는 이 명세를 사람이 읽기 쉽게 보여주고 브라우저에서 API를 테스트할 수 있게 한다.

수동으로 JSON 예시를 복사해 문서를 작성하면 실제 DTO가 바뀌었을 때 문서가 뒤처질 수 있다. TSOA를 사용해 Controller와 타입을 기준으로 명세를 생성했다.

```ts
@Route("users")
@Tags("Users")
export class UserController extends Controller {
  /**
   * 사용자 정보를 조회합니다.
   */
  @Get("{userId}")
  @Response<ApiErrorResponse>(404, "사용자를 찾을 수 없음")
  public getUser(
    @Path() userId: number,
  ): Promise<ApiResponse<UserResponse>> {
    return userService.getUser(userId);
  }
}
```

## Type-Driven Documentation

Request와 Response Type이 OpenAPI Schema의 기준이 된다.

```ts
export type UserResponse = {
  userId: number;
  email: string;
  name: string;
};
```

타입을 수정한 뒤 명세를 다시 생성하면 문서에도 같은 변경이 반영된다.

```bash
npx tsoa spec
npx tsoa routes
```

이 방식은 코드와 문서를 이중으로 관리하는 비용을 줄인다. 다만 타입만으로 전달하기 어려운 서비스 규칙과 오류 조건은 Decorator와 설명을 추가해야 한다.

## 프론트엔드 연동 전에 확인할 것

- 운영 프론트엔드 Origin이 CORS 설정에 포함되어 있는가
- 인증 Header와 Cookie 정책이 일치하는가
- Preflight 요청이 인증 미들웨어에 막히지 않는가
- Request와 Response Schema가 실제 DTO와 같은가
- 성공뿐 아니라 주요 실패 응답도 문서화되어 있는가

CORS와 Swagger는 API 구현 뒤에 덧붙이는 설정이 아니었다. 브라우저가 서버에 접근할 수 있게 만들고, 프론트엔드가 요청과 응답을 정확히 이해하게 만드는 연동 계약의 일부였다.
