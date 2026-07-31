---
title: "Express 미들웨어와 에러 핸들링"
description: "TSOA로 Route와 문서 생성을 자동화하고 Express 미들웨어를 활용해 API 응답과 오류 처리 형식을 통일했습니다."
date: "2026-07-31"
category: "Backend"
series: "Node.js 스터디"
seriesOrder: 7
tags:
  - "Node.js"
  - "Express"
  - "TSOA"
  - "Error Handling"
---

API가 늘어나자 Controller마다 Route를 연결하고, 성공과 실패 응답을 반복해서 작성하는 문제가 보이기 시작했다. TSOA로 Controller와 Route의 연결을 정리하고, Express 미들웨어를 사용해 모든 요청에 공통으로 필요한 로직과 오류 처리를 분리했다.

## TSOA로 Controller와 Route 연결하기

TSOA는 TypeScript 타입과 Decorator를 바탕으로 Express Route와 OpenAPI 문서를 생성한다.

```ts
@Route("users")
@Tags("Users")
export class UserController extends Controller {
  @Get("{userId}")
  public async getUser(
    @Path() userId: number,
  ): Promise<UserResponse> {
    return userService.getUser(userId);
  }
}
```

Controller의 메서드와 반환 타입이 Route와 문서의 기준이 된다. 설정 파일에는 Controller 경로와 생성할 Route 파일 위치를 지정한다.

```json
{
  "entryFile": "src/index.ts",
  "controllerPathGlobs": ["src/**/*.controller.ts"],
  "routes": {
    "routesDir": "src/generated"
  }
}
```

생성된 파일은 직접 수정하지 않고 명령으로 다시 만든다.

```bash
npx tsoa routes
npx tsoa spec
```

## 미들웨어의 역할

Express 미들웨어는 요청을 받은 뒤 최종 응답이 만들어지기 전까지 순서대로 실행되는 함수다.

```ts
app.use(express.json());
app.use(requestLogger);
app.use("/api", routes);
app.use(errorHandler);
```

미들웨어는 `req`, `res`, `next`를 받고, `next()`를 호출하면 다음 단계로 요청을 넘긴다.

공통 처리에 적합한 예시는 다음과 같다.

- JSON Body 파싱
- 요청 로그
- CORS
- Cookie 파싱
- 사용자 인증
- 오류 응답

비즈니스 로직과 관계없는 공통 처리를 Controller에서 빼면 각 API는 자신의 기능에 집중할 수 있다.

## 요청 로그와 Cookie 처리

`morgan` 같은 로깅 미들웨어를 사용하면 메서드, URL, 상태 코드, 응답 시간과 크기를 일정한 형식으로 기록할 수 있다. 개발 중 어떤 요청이 실패했는지 빠르게 확인하는 데 도움이 된다.

`cookie-parser`는 브라우저가 문자열로 전달한 Cookie를 객체 형태로 읽게 한다. 서명된 Cookie는 서버의 비밀 키로 값의 변조 여부를 확인할 수 있지만, 내용 자체를 암호화하는 것은 아니다.

## 인증도 미들웨어로 분리할 수 있다

로그인이 필요한 모든 Controller에서 토큰 검증을 반복하지 않고 인증 미들웨어를 둘 수 있다.

```ts
export function requireAuth(req, _res, next) {
  try {
    const token = readBearerToken(req.headers.authorization);
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError(401, "UNAUTHORIZED", "로그인이 필요합니다."));
  }
}
```

```ts
router.get("/users/me", requireAuth, getMyPage);
```

미들웨어는 사용자가 누구인지 확인하고, Service는 확인된 사용자를 기준으로 비즈니스 규칙을 처리한다.

## API 응답 형식 통일하기

API마다 반환 구조가 다르면 프론트엔드는 Endpoint별로 성공과 실패를 따로 해석해야 한다. 공통 응답 형태를 정했다.

```ts
type ApiResponse<T> =
  | {
      resultType: "SUCCESS";
      data: T;
      error: null;
    }
  | {
      resultType: "FAIL";
      data: null;
      error: {
        errorCode: string;
        reason: string;
      };
    };
```

성공 응답에서는 `data`에 결과를 넣고, 실패 응답에서는 프론트엔드가 분기할 수 있는 `errorCode`와 사용자 또는 개발자에게 보여줄 `reason`을 전달한다.

## Custom Error로 상태와 원인 전달하기

기본 `Error`에는 HTTP 상태 코드와 애플리케이션 오류 코드가 없다. 필요한 정보를 가진 `AppError`를 만들었다.

```ts
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);
  }
}
```

Service에서는 HTTP 응답을 직접 만들지 않고 의미에 맞는 오류를 던진다.

```ts
if (existingUser) {
  throw new AppError(
    409,
    "DUPLICATE_EMAIL",
    "이미 가입된 이메일입니다.",
  );
}
```

## 전역 Error Middleware

오류 미들웨어는 다른 미들웨어와 달리 네 개의 인자를 받는다.

```ts
export function errorHandler(error, _req, res, _next) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      resultType: "FAIL",
      data: null,
      error: {
        errorCode: error.errorCode,
        reason: error.message,
        data: error.data,
      },
    });
  }

  return res.status(500).json({
    resultType: "FAIL",
    data: null,
    error: {
      errorCode: "INTERNAL_SERVER_ERROR",
      reason: "서버 내부 오류가 발생했습니다.",
    },
  });
}
```

알 수 없는 오류의 내부 메시지와 Stack Trace는 운영 응답에 그대로 노출하지 않는다. 서버 로그에는 원인을 남기되 클라이언트에는 정해진 메시지만 반환한다.

## Error Code가 필요한 이유

모든 실패를 `UNKNOWN`으로 보내면 프론트엔드는 사용자가 다시 입력해야 하는지, 로그인 화면으로 이동해야 하는지, 잠시 후 재시도해야 하는지 판단할 수 없다.

```text
UNAUTHORIZED     → 로그인 화면으로 이동
DUPLICATE_EMAIL  → 이메일 입력란에 안내
USER_NOT_FOUND   → 존재하지 않는 사용자 안내
```

상태 코드가 HTTP 수준의 실패 종류를 표현한다면, Error Code는 서비스 안에서의 구체적인 원인을 표현한다.

이번 단계에서 Controller의 반복 코드가 줄고 오류 처리 위치가 한곳으로 모였다. 미들웨어와 공통 응답 구조는 파일을 정리하는 장치가 아니라, 클라이언트가 모든 API를 같은 방식으로 사용할 수 있게 만드는 규칙이었다.
