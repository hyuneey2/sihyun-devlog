---
title: "API 연동 - 프론트엔드"
description: "프론트엔드 API 연동 전에 알아야 했던 것들"
date: "2026-07-23"
category: "Frontend"
tags:
  - "React"
  - "API"
  - "Auth"
  - "Vite"
---
# 프론트엔드 API 연동 전 확인 사항

API 연동은 단순히 주소에 요청을 보내는 작업이 아니다. 엔드포인트, 요청 값, 응답 구조, 예외 처리 등 백엔드 명세와 프론트엔드 환경을 맞추는 과정이다. 프로젝트를 진행하며 확립한 API 연동 기준을 정리한다.

## 1. Swagger API 명세 분석

프론트엔드 코드 작성 전 Swagger를 통해 다음 항목을 검증한다.

* **엔드포인트와 HTTP 메서드:** 주소가 같아도 메서드(GET, POST, PATCH, DELETE)에 따라 목적과 동작이 다르다.
* **Parameters (Path / Query):** 필수 포함 값과 선택 값을 구분한다.
* **Request Body:** 서버가 요구하는 필드명과 자료형(문자열, 숫자, null 등)을 프론트엔드 입력값과 일치시킨다.
* **Responses:** HTTP 상태 코드와 실제 데이터가 담긴 객체 구조(예: `response.data.data.schedules`)를 파악한다.
* **Authorize:** 인증 토큰(Bearer) 필요 여부와 헤더 전달 방식을 확인한다.
* **Try it out:** 코드를 작성하기 전 Swagger에서 직접 요청을 보내 응답 성공 여부를 선행 테스트한다.

## 2. HTTP 메서드와 데이터 위치 구분

요청의 목적에 따라 메서드와 데이터 전송 위치를 분리한다.

* **GET (조회):** Request Body를 사용하지 않는다.
* **Path Parameter:** 특정 리소스 식별 (`/api/v1/schedules/15`)
* **Query Parameter:** 조회 조건 및 필터링 (`/api/v1/schedules?startDate=2026-07-01`)


* **POST (생성):** 새로운 데이터를 Request Body에 담아 전송한다. (주로 201 Created 응답)
* **PATCH (수정):** 변경할 데이터만 Request Body에 포함하여 전송한다.
* **DELETE (삭제):** 특정 데이터를 삭제한다. 삭제 범위 지정 시 Query Parameter를 혼합하여 사용할 수 있다.

## 3. 예외 및 에러 처리 기준 수립

성공 데이터보다 에러 처리 기준을 먼저 설계한다.

* **상태 코드와 에러 코드:** HTTP 상태 코드(400, 401, 404, 500 등)와 함께 서버 커스텀 `errorCode`를 확인하여 화면의 분기 처리(재로그인, 에러 메시지 노출 등)를 설계한다.
* **데이터 없음의 정의:** 목록 조회 시 빈 배열(`[]`), 단일 객체 조회 시 `null` 등 서버의 '데이터 없음' 처리 방식을 확인한다. 프론트엔드에서는 런타임 에러 방지를 위해 기본값을 설정한다.

```ts
// 배열 메서드 에러 방지를 위한 기본값 설정
const schedules = response.data.data.schedules ?? [];

```

## 4. 데이터 포맷 동기화

* **날짜 형식:** 서버에서 요구하는 형식(`YYYY-MM-DD`)을 확인한다. 브라우저의 `Date` 객체 변환 시 시간대(KST vs UTC) 차이로 인해 날짜가 변경될 수 있으므로, 불필요한 객체 변환을 피하고 문자열로 처리하는 것을 고려한다.

## 5. 공통 설정 및 아키텍처 분리

* **인증 정보 중앙 관리:** Axios 인터셉터를 활용해 요청 시점에 로컬 스토리지의 토큰을 헤더에 주입한다. 401 응답 시 공통 만료 처리를 수행하여 코드 중복을 막는다.
* **환경별 주소 분리:** 로컬 개발(Vite 프록시)과 운영 배포 환경의 API 엔드포인트를 환경변수로 분리한다.
* **CORS 오류 검증:** 브라우저 콘솔의 CORS 에러는 실제 서버 에러(500 등)일 수 있다. Network 탭에서 Request/Response 상태를 교차 검증한다.

## 6. API 함수와 UI 컴포넌트 분리

컴포넌트 내부에 API 통신 코드를 직접 작성하지 않는다.

```ts
// api/schedules.ts (API 통신 책임)
export async function getSchedules(params: ScheduleQuery) {
  const response = await apiClient.get('/api/v1/schedules', { params });
  return response.data.data.schedules;
}

```

화면 컴포넌트는 반환된 데이터를 바탕으로 상태(로딩, 성공, 실패)에 따른 렌더링에만 집중한다.

```tsx
// components/ScheduleList.tsx (UI 렌더링 책임)
if (isLoading) return <Loading />;
if (errorMessage) return <ErrorMessage message={errorMessage} />;
if (schedules.length === 0) return <EmptyState />;

return schedules.map(schedule => <ScheduleItem key={schedule.id} data={schedule} />);

```

## 7. 실제 연동 검증 순서

1. Swagger 명세(주소, 메서드, 파라미터, 응답 구조) 확인
2. Swagger 테스트 기능을 통한 사전 검증
3. 공통 클라이언트 및 개별 API 요청 함수 작성
4. UI 컴포넌트에 로딩, 성공, 에러 상태 연동
5. 브라우저 Network 탭에서 Request Payload 및 Response 검증
6. 로컬 및 배포 환경 교차 테스트