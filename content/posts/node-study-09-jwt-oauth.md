---
title: "JWT 인증과 Google OAuth 로그인"
description: "인증과 인가, Access·Refresh Token의 역할을 구분하고 Passport와 Google OAuth를 기존 JWT 인증 흐름에 연결했습니다."
date: "2026-07-31"
category: "Backend"
series: "Node.js 스터디"
seriesOrder: 9
tags:
  - "Node.js"
  - "JWT"
  - "OAuth 2.0"
  - "Authentication"
---

로그인 API를 구현하면서 인증과 인가, 세션과 JWT, Access Token과 Refresh Token의 역할을 구분했다. 소셜 로그인도 Google 인증만 성공하면 끝나는 것이 아니라, 외부에서 받은 사용자 정보를 우리 서비스의 사용자와 연결하고 최종적으로 우리 서버의 인증 수단을 발급해야 했다.

## 인증과 인가

인증(Authentication)은 사용자가 누구인지 확인하는 과정이다. 아이디와 비밀번호로 로그인하거나 Google 계정으로 본인을 확인하는 것이 인증에 해당한다.

인가(Authorization)는 인증된 사용자가 특정 기능을 사용할 권한이 있는지 판단하는 과정이다.

```text
로그인 성공       → 인증
관리자 페이지 접근 → 인가
```

항상 인증이 먼저이고, 이후 사용자 역할이나 자원 소유권을 기준으로 인가를 확인한다.

## Session과 JWT

Session 방식은 서버가 로그인 상태를 저장하고 클라이언트에는 Session ID를 전달한다. 서버가 상태를 기억하므로 강제 로그아웃과 상태 관리가 쉽지만, 서버가 여러 대라면 Session 저장소를 공유해야 한다.

JWT 방식은 서버가 사용자 식별 정보를 담은 서명된 Token을 발급하고, 요청마다 Token을 검증한다. 서버가 각 로그인 상태를 별도로 저장하지 않아도 되지만 발급한 Access Token을 즉시 무효화하기 어렵다.

서비스 요구사항과 운영 구조에 따라 선택해야 하며 JWT가 항상 Session보다 우월한 것은 아니다.

## JWT의 구조

JWT는 세 부분으로 구성된다.

```text
Header.Payload.Signature
```

- Header: Token 종류와 서명 알고리즘
- Payload: 사용자 식별 정보와 만료 시간
- Signature: Token이 변경되지 않았는지 확인하는 서명

Payload는 암호화된 영역이 아니므로 누구나 내용을 확인할 수 있다. 비밀번호나 민감한 개인정보를 넣으면 안 된다.

## Access Token과 Refresh Token

Access Token은 API 요청에 사용하는 짧은 수명의 Token이다. Refresh Token은 Access Token이 만료됐을 때 새 Access Token을 발급받기 위한 긴 수명의 Token이다.

```text
로그인
→ Access Token + Refresh Token 발급
→ Access Token으로 API 요청
→ Access Token 만료
→ Refresh Token 검증
→ 새 Access Token 발급
```

Access Token의 수명을 짧게 유지하면 노출되었을 때 사용할 수 있는 시간을 줄일 수 있다. 대신 사용자가 자주 다시 로그인하지 않도록 Refresh Token을 사용한다.

Refresh Token은 더 오래 유효하므로 안전한 저장과 폐기 전략이 필요하다. 데이터베이스나 Cache에 저장해 로그아웃 시 제거하고, 재발급할 때 Rotation을 적용하는 방식도 검토할 수 있다.

## Bearer Token 전달하기

보호된 API는 `Authorization` Header에서 Access Token을 받는다.

```http
Authorization: Bearer {accessToken}
```

인증 미들웨어는 Header 형식을 확인하고 Token의 서명과 만료 시간을 검증한 뒤 사용자 정보를 Request에 연결한다.

```ts
export function requireAuth(req, _res, next) {
  try {
    const token = getBearerToken(req.headers.authorization);
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new AppError(401, "UNAUTHORIZED", "유효하지 않은 인증입니다."));
  }
}
```

## OAuth 2.0의 역할

OAuth 2.0은 사용자가 비밀번호를 우리 서비스에 전달하지 않고도 외부 서비스의 자원 접근 권한을 위임할 수 있게 하는 표준이다.

Google 로그인에서는 Authorization Code 흐름을 사용했다.

```text
1. 사용자가 Google 로그인 화면으로 이동
2. 정보 제공 범위에 동의
3. Google이 Redirect URI로 Authorization Code 전달
4. 서버가 Code를 Google Token과 교환
5. Google API에서 사용자 정보 조회
6. 우리 서비스 사용자 조회 또는 생성
7. 우리 서버의 JWT 발급
```

Google Access Token은 Google API를 호출하기 위한 것이고, 우리 서비스의 Access Token은 우리 API 인증에 사용한다. 두 Token의 발급 주체와 사용 범위를 구분해야 한다.

## Passport로 Google Strategy 연결하기

Passport의 Google Strategy에 환경 변수로 발급받은 Client ID와 Client Secret, Callback URL을 설정했다.

```ts
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.PASSPORT_GOOGLE_CLIENT_ID,
      clientSecret: process.env.PASSPORT_GOOGLE_CLIENT_SECRET,
      callbackURL: "/oauth2/callback/google",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      const user = await findOrCreateGoogleUser(profile);
      done(null, user);
    },
  ),
);
```

환경 변수에는 실제 값을 저장하고 저장소에는 예시 키만 남긴다.

```env
PASSPORT_GOOGLE_CLIENT_ID=
PASSPORT_GOOGLE_CLIENT_SECRET=
JWT_SECRET=
```

## Google 사용자와 서비스 사용자 연결하기

Google Profile의 이메일만으로 사용자를 구분하면 Provider 정책이나 이메일 변경을 고려하기 어렵다. Provider와 Provider User ID를 함께 저장해 외부 계정과 내부 사용자의 연결을 명시할 수 있다.

```text
OAuthAccount
├─ provider: google
├─ providerUserId
└─ userId
```

처음 로그인한 사용자라면 최소 정보로 계정을 만들고, 서비스에 필요한 전화번호나 생일은 별도 프로필 수정 흐름에서 받도록 나눌 수 있다.

## Callback 이후 우리 JWT 발급하기

Google 인증이 끝난 뒤에는 내부 사용자를 기준으로 우리 서버의 Token을 발급한다.

```ts
router.get(
  "/oauth2/callback/google",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const accessToken = generateAccessToken(req.user);
    const refreshToken = generateRefreshToken(req.user);

    return res.json({ accessToken, refreshToken });
  },
);
```

실제 서비스에서는 Token을 URL Query에 그대로 노출하지 않고, Redirect 방식과 Cookie 정책을 프론트엔드와 함께 결정해야 한다.

## 인증 기능을 기존 API에 적용하며 확인한 점

- 사용자 ID를 하드코딩하지 않고 인증 결과에서 가져온다.
- 로그인한 사용자와 요청 자원의 소유권을 비교한다.
- Access Token 만료와 잘못된 Token을 같은 형식으로 처리한다.
- Refresh Token 저장과 폐기 정책을 정한다.
- OAuth Callback URL을 Google Console 설정과 정확히 일치시킨다.
- Client Secret과 JWT Secret은 코드와 Git 기록에 남기지 않는다.

인증은 로그인 성공 응답 하나로 끝나지 않았다. 이후 모든 요청에서 사용자를 신뢰할 수 있게 식별하고, 권한을 확인하며, Token 만료와 재발급까지 일관되게 처리하는 전체 흐름이었다.
