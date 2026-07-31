---
title: "SQL 조회와 페이지네이션"
description: "JOIN과 집계 쿼리를 작성하고 Offset·Cursor 페이지네이션의 차이와 인덱스가 조회 성능에 미치는 영향을 정리했습니다."
date: "2026-07-31"
category: "Backend"
series: "Node.js 스터디"
seriesOrder: 2
tags:
  - "Node.js"
  - "SQL"
  - "Pagination"
  - "Database"
---

ERD로 테이블 관계를 정한 뒤에는 화면에 필요한 결과를 SQL로 만드는 연습을 했다. 하나의 테이블을 조회하는 문법보다 여러 관계를 연결하고, 중복을 제어하며, 많은 결과를 일정한 단위로 나누는 과정에 집중했다.

## 조회 목적에 맞게 JOIN하기

회원별 미션 목록을 조회하려면 사용자별 참여 기록을 기준으로 미션과 가게를 연결해야 한다.

```sql
SELECT
  um.id AS user_mission_id,
  m.id AS mission_id,
  s.name AS store_name,
  m.reward_point,
  um.status,
  um.started_at
FROM user_mission um
JOIN mission m ON m.id = um.mission_id
JOIN store s ON s.id = m.store_id
WHERE um.user_id = ?
  AND um.status = 'IN_PROGRESS'
ORDER BY um.started_at DESC, um.id DESC;
```

`user_mission`을 기준 테이블로 둔 이유는 조회 대상이 “사용자가 참여한 미션”이기 때문이다. 테이블을 많이 연결하는 것보다 어떤 행이 결과 한 건을 의미하는지를 먼저 정하면 JOIN의 출발점도 분명해진다.

## 집계 결과 만들기

`COUNT`, `SUM`, `AVG` 같은 집계 함수는 `GROUP BY`와 함께 사용한다. 예를 들어 회원별 미션 완료 횟수를 구할 수 있다.

```sql
SELECT
  u.id,
  u.name,
  COUNT(*) AS completed_count
FROM user u
JOIN user_mission um ON um.user_id = u.id
WHERE um.status = 'COMPLETED'
GROUP BY u.id, u.name
ORDER BY completed_count DESC;
```

집계 전에 JOIN으로 행이 늘어나면 실제보다 큰 값이 계산될 수 있다. 집계 대상이 무엇인지 확인하고, 필요하면 `COUNT(DISTINCT ...)`나 먼저 중복을 제거한 서브쿼리를 사용해야 한다.

## Offset 기반 페이지네이션

Offset 방식은 앞에서 몇 건을 건너뛴 뒤 정해진 개수만 가져온다.

```sql
SELECT *
FROM review
ORDER BY created_at DESC, id DESC
LIMIT 10 OFFSET 20;
```

페이지 번호가 3이고 한 페이지에 10개를 보여준다면 `OFFSET`은 `(3 - 1) * 10`이 된다.

장점은 페이지 번호로 바로 이동할 수 있고 구현이 단순하다는 점이다. 반면 뒤 페이지로 갈수록 데이터베이스가 건너뛸 행도 많아진다. 조회 도중 새 데이터가 추가되거나 삭제되면 같은 항목이 다시 보이거나 일부 항목을 놓칠 수도 있다.

## Cursor 기반 페이지네이션

Cursor 방식은 마지막으로 본 항목의 정렬값을 기준으로 다음 데이터를 찾는다.

```sql
SELECT *
FROM user_mission
WHERE user_id = ?
  AND status = 'IN_PROGRESS'
  AND (
    started_at < ?
    OR (started_at = ? AND id < ?)
  )
ORDER BY started_at DESC, id DESC
LIMIT 10;
```

`started_at`만 커서로 사용하면 같은 시간에 생성된 행의 순서를 확정할 수 없다. 그래서 고유한 `id`를 보조 정렬 기준으로 함께 사용했다.

```text
ORDER BY started_at DESC, id DESC
Cursor: (lastStartedAt, lastId)
```

이 구조는 데이터가 추가되어도 이미 본 항목 이후를 안정적으로 이어서 조회할 수 있다. 무한 스크롤이나 “더 보기” 방식에 적합하지만 특정 페이지 번호로 즉시 이동하기는 어렵다.

## 정렬과 Cursor는 같은 기준을 사용해야 한다

Cursor 페이지네이션에서 가장 중요한 조건은 `WHERE`의 비교 기준과 `ORDER BY`가 일치하는 것이다. 최신순으로 정렬하면서 커서는 오래된 방향으로 비교해야 다음 페이지가 겹치지 않는다.

또한 정렬값이 같은 경우를 처리할 고유한 보조 키가 필요하다. 이 조건을 빼면 요청할 때마다 같은 값들의 순서가 바뀔 수 있다.

## 인덱스가 필요한 이유

인덱스는 테이블 전체를 매번 확인하지 않고 조건에 맞는 행을 빠르게 찾기 위한 자료 구조다. 자주 사용하는 필터와 정렬 조건을 기준으로 복합 인덱스를 검토할 수 있다.

```sql
CREATE INDEX user_mission_list_idx
ON user_mission (user_id, status, started_at, id);
```

인덱스는 조회를 빠르게 하지만 저장 공간을 사용하고, 데이터가 추가·수정·삭제될 때 함께 갱신해야 한다. 모든 컬럼에 만드는 것이 아니라 실제 쿼리의 조건과 정렬 순서를 기준으로 선택해야 한다.

## ORM과 Raw SQL을 함께 보는 기준

ORM은 객체와 테이블을 연결해 코드로 데이터베이스를 다룰 수 있게 한다. 기본 CRUD를 빠르게 작성하고 타입 지원을 받을 수 있다는 장점이 있다. Raw SQL은 복잡한 집계와 조회 최적화를 직접 제어하기 쉽다.

두 방식은 대체 관계라기보다 용도에 따라 함께 사용할 수 있다.

- 단순한 생성·수정·조회는 ORM으로 일관되게 관리한다.
- 복잡한 집계나 성능이 중요한 조회는 생성되는 SQL을 확인한다.
- 필요한 경우 Raw SQL을 사용하되 파라미터 바인딩으로 SQL Injection을 막는다.

이번 학습을 통해 페이지네이션은 응답 배열을 자르는 프론트엔드 작업이 아니라, 정렬과 조회 조건을 데이터베이스 단계에서 설계하는 일이라는 점을 분명히 이해했다.
