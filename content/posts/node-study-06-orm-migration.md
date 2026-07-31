---
title: "ORM과 데이터베이스 마이그레이션"
description: "Raw SQL로 구현한 Repository를 Prisma ORM으로 전환하고 Schema·Migration·Cursor 페이지네이션을 관리한 과정을 정리했습니다."
date: "2026-07-31"
category: "Backend"
series: "Node.js 스터디"
seriesOrder: 6
tags:
  - "Node.js"
  - "Prisma"
  - "ORM"
  - "Migration"
---

직접 작성한 SQL로 회원가입 API를 구현한 뒤 Prisma ORM을 적용했다. 목표는 SQL을 없애는 것이 아니라 테이블 구조와 조회 결과를 타입으로 관리하고, 데이터베이스 변경 이력을 팀과 공유할 수 있게 만드는 것이었다.

## ORM이 해결하려는 문제

ORM은 객체와 관계형 데이터베이스 테이블을 연결한다. 문자열로 SQL을 작성하는 대신 언어의 객체와 메서드로 데이터를 조회하고 저장한다.

```ts
const user = await prisma.user.findUnique({
  where: { email },
});
```

장점은 다음과 같다.

- 모델을 기준으로 타입이 생성된다.
- 기본 CRUD 코드가 짧아진다.
- 자동 완성과 컴파일 단계 오류 검사를 사용할 수 있다.
- 여러 Repository에서 반복하는 변환 코드가 줄어든다.

반면 복잡한 조회에서는 생성되는 SQL을 예측하기 어렵고, ORM 사용법과 데이터베이스 동작을 함께 알아야 한다. ORM을 쓴다고 SQL과 인덱스 지식이 필요 없어지는 것은 아니었다.

## Prisma Schema로 모델 정의하기

Prisma에서는 `schema.prisma`에 데이터베이스 연결과 모델을 정의한다.

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  createdAt DateTime @default(now()) @map("created_at")

  @@map("user")
}
```

애플리케이션에서는 `camelCase`를 사용하고 데이터베이스에서는 `snake_case`를 사용할 수 있도록 `@map`과 `@@map`을 활용했다. 코드 스타일을 위해 실제 테이블 이름까지 바꾸는 일을 피할 수 있다.

## Prisma Client를 한 번만 생성하기

Repository마다 Prisma Client를 새로 만들면 연결이 불필요하게 늘어날 수 있다. 공통 모듈에서 인스턴스를 만들고 재사용했다.

```ts
import { PrismaClient } from "./generated/client";

export const prisma = new PrismaClient({
  log: ["error", "warn"],
});
```

개발 중 생성 파일 변경 때문에 서버가 계속 재시작된다면 `generated` 경로를 nodemon 감시 대상에서 제외해야 한다.

## Raw SQL Repository를 ORM으로 전환하기

기존 조회와 저장 로직을 Prisma 메서드로 바꿨다.

```ts
export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export function createUser(data: CreateUserData) {
  return prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}
```

`select`로 필요한 값만 반환하면 비밀번호처럼 외부 계층에 넘기지 않아야 하는 컬럼을 처음부터 제외할 수 있다.

관계 데이터는 `include`나 중첩 `select`로 함께 조회할 수 있지만, 필요한 범위를 명확히 지정하지 않으면 예상보다 많은 데이터가 조회될 수 있다.

## Migration으로 스키마 변경 기록하기

개발자가 각자 테이블을 직접 수정하면 현재 데이터베이스가 어떤 변경을 거쳤는지 알기 어렵다. Prisma Migrate를 사용해 Schema 변경을 SQL 파일로 남겼다.

```bash
npx prisma migrate dev --name add-user-preference
```

이 명령은 Schema와 실제 데이터베이스 차이를 계산하고 Migration 파일을 생성한 뒤 로컬 데이터베이스에 적용한다.

Migration 파일은 코드와 함께 커밋해야 한다. 다른 팀원은 같은 파일을 순서대로 적용해 동일한 구조를 만들 수 있다.

이미 공유된 Migration을 수정하는 대신 새 Migration을 추가하는 이유도 여기에 있다. 기존 변경 이력을 바꾸면 누군가의 데이터베이스에는 이미 다른 SQL이 적용된 상태일 수 있다.

## 목록 API에 Cursor 적용하기

가게 리뷰 목록처럼 데이터가 계속 늘어나는 기능은 모든 행을 한 번에 반환하지 않고 Cursor 기반으로 나눴다.

```ts
const reviews = await prisma.review.findMany({
  where: {
    storeId,
    ...(cursorId ? { id: { lt: cursorId } } : {}),
  },
  orderBy: {
    id: "desc",
  },
  take: size + 1,
});
```

요청한 개수보다 한 건 더 조회해 다음 페이지가 있는지 판단한다.

```ts
const hasNext = reviews.length > size;
const items = hasNext ? reviews.slice(0, size) : reviews;
const nextCursor = hasNext ? items.at(-1)?.id : null;
```

응답에는 목록뿐 아니라 다음 요청에 필요한 정보를 함께 넣었다.

```json
{
  "items": [],
  "pagination": {
    "hasNext": true,
    "nextCursor": 42
  }
}
```

## ORM을 적용하며 세운 기준

Prisma는 테이블 구조와 타입을 연결하고 Migration을 관리하는 데 유용했다. 하지만 성능을 자동으로 보장하지는 않는다.

- `include`로 불필요한 관계까지 조회하지 않는다.
- 목록 API에는 `take`와 Cursor를 적용한다.
- 자주 사용하는 조건과 정렬에 맞는 인덱스를 검토한다.
- 복잡한 쿼리는 로그와 실행 계획을 확인한다.
- Schema 변경은 Migration 파일로 공유한다.

ORM을 도입한 결과 Repository 코드는 단순해졌지만, 더 중요한 변화는 데이터베이스 구조와 변경 이력이 애플리케이션 코드 안에서 함께 관리되기 시작한 것이었다.
