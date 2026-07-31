---
title: "REST API와 서버 요청 흐름"
description: "REST API의 자원 중심 설계 원칙과 Path·Query·Body·Header의 역할을 익히고 서비스 기능을 API 명세로 옮겼습니다."
date: "2026-07-31"
category: "Backend"
series: "Node.js 스터디"
seriesOrder: 3
tags:
  - "Node.js"
  - "REST API"
  - "HTTP"
  - "Express"
---

데이터베이스 구조를 정한 뒤 클라이언트가 그 데이터를 어떻게 요청할지 API를 설계했다. 처음에는 화면의 버튼 이름을 그대로 URL에 넣으려 했지만, REST API에서는 URL이 행동보다 자원을 표현하도록 만드는 편이 일관적이었다.

## API는 내부 구현을 감춘 인터페이스다

API는 클라이언트가 서버의 내부 코드를 알지 못해도 정해진 형식으로 기능을 사용할 수 있게 한다. 프론트엔드는 Endpoint와 요청 형식, 응답 형식만 알면 된다.

```text
HTTP Method + URL = API Endpoint
```

대표적인 HTTP 메서드의 역할은 다음과 같다.

- `GET`: 자원 조회
- `POST`: 자원 생성 또는 처리 요청
- `PUT`: 자원 전체 교체
- `PATCH`: 자원 일부 수정
- `DELETE`: 자원 삭제

같은 URL이라도 메서드가 다르면 다른 동작을 표현할 수 있다.

```text
GET    /users/1
PATCH  /users/1
DELETE /users/1
```

## URL은 자원을 중심으로 표현한다

RESTful Endpoint를 설계할 때 적용한 기준은 다음과 같다.

- URL에 `create`, `get`, `delete` 같은 동사를 반복하지 않는다.
- 자원 이름은 명사와 복수형을 사용한다.
- 특정 자원은 Path Variable로 식별한다.
- 포함 관계가 분명하면 계층 구조로 표현한다.
- 단어 구분은 하이픈을 사용한다.

```text
POST /createReview       (X)
POST /reviews            (O)

GET /getUserMission      (X)
GET /users/me/missions   (O)
```

다만 REST 규칙을 기계적으로 적용하는 것보다 프론트엔드가 URL만 보고도 의미를 이해할 수 있는지가 더 중요했다. 계층이 너무 깊어지면 오히려 읽기 어렵기 때문에 핵심 자원을 기준으로 단순하게 유지했다.

## Path, Query, Body, Header 구분하기

### Path Variable

특정 자원 한 건을 식별할 때 사용한다.

```text
GET /missions/{missionId}
```

### Query String

검색, 필터, 정렬, 페이지네이션처럼 조회 조건을 추가할 때 사용한다.

```text
GET /users/me/missions?status=IN_PROGRESS&size=10
```

Query String은 Endpoint의 자원 구조를 바꾸지 않고 선택 조건만 전달한다.

### Request Body

생성하거나 수정할 실제 데이터를 전달한다. 보통 JSON 형식을 사용한다.

```json
{
  "rating": 5,
  "content": "음식이 맛있어요."
}
```

### Request Header

본문과 분리된 요청의 부가 정보를 전달한다. 인증 토큰과 데이터 형식이 대표적이다.

```text
Authorization: Bearer {accessToken}
Content-Type: application/json
```

## 서비스 요구사항을 API로 옮기기

사용자와 미션, 리뷰를 기준으로 필요한 Endpoint를 정리했다.

```text
POST  /api/auth/signup
GET   /api/users/me
GET   /api/users/me/missions
PATCH /api/users/me/missions/{userMissionId}/complete
POST  /api/users/me/missions/{userMissionId}/reviews
```

진행 중 미션과 완료한 미션은 별도 URL을 만들지 않고 같은 목록 Endpoint에서 상태값으로 구분했다.

```text
GET /api/users/me/missions?status=IN_PROGRESS
GET /api/users/me/missions?status=COMPLETED
```

이 구조는 조회 대상이 모두 “내 미션 목록”이라는 점을 유지하면서 조건만 달리할 수 있다.

## 응답은 성공과 실패 모두 설계해야 한다

성공 응답만 정하면 프론트엔드는 오류가 발생했을 때 원인을 구분하기 어렵다. HTTP 상태 코드와 함께 일정한 응답 형식을 사용해야 한다.

```json
{
  "success": true,
  "data": {
    "userMissionId": 12,
    "status": "COMPLETED"
  }
}
```

- `200 OK`: 조회·수정 성공
- `201 Created`: 생성 성공
- `400 Bad Request`: 요청값 또는 형식 오류
- `401 Unauthorized`: 인증 필요
- `403 Forbidden`: 권한 부족
- `404 Not Found`: 자원 없음
- `409 Conflict`: 중복이나 상태 충돌
- `500 Internal Server Error`: 서버 내부 오류

## 홈 화면 전용 API가 꼭 필요한가

설계 중 가장 고민한 부분은 홈 화면 전용 API였다. 화면 하나에 사용자 정보와 진행 중 미션이 함께 보인다는 이유로 `/home` Endpoint를 따로 만들 수 있었다.

하지만 홈은 독립된 자원이라기보다 이미 존재하는 사용자와 미션 데이터를 조합한 화면이었다. 별도 API를 만들면 기존 `users`와 `missions` API의 책임과 겹칠 가능성이 컸다.

초기 요구사항에서는 사용자 정보 API와 내 미션 목록 API를 재사용하는 방향을 선택했다. 이후 홈에서 여러 집계값을 한 번에 계산해야 하거나 네트워크 요청 수가 실제 문제가 되면, 그때 화면 조합을 위한 집계 API를 추가하는 편이 낫다고 판단했다.

API 설계의 기준은 화면마다 URL을 하나씩 만드는 것이 아니었다. 데이터 자원의 책임을 유지하면서 클라이언트가 필요한 값을 예측 가능한 방식으로 요청할 수 있게 만드는 일이었다.
