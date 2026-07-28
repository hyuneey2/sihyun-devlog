## 개발 블로그

프로젝트에서 고민하고 해결한 과정을 기록하는 개인 개발 블로그입니다.

### 기술 구성

- Vinext / React / TypeScript
- Markdown 기반 게시글
- Tailwind CSS 4

###로컬 실행

```bash
npm install
npm run dev
```

### 글 추가하기

`content/posts` 폴더에 `글-주소.md` 파일을 추가합니다.

```md
---
title: "글 제목"
description: "목록과 검색 결과에 보일 한 줄 설명"
date: "2026-07-28"
category: "Frontend"
tags:
  - React
  - TypeScript
---

여기부터 Markdown으로 본문을 작성합니다.
```

파일명이 글 주소가 됩니다. 예를 들어
`content/posts/my-first-post.md`는 `/posts/my-first-post`에서 열립니다.

### 주요 폴더

```text
app/
  about/          소개 페이지
  posts/          글 목록과 상세 페이지
components/       공통 화면 컴포넌트
content/posts/    Markdown 게시글
lib/posts.ts      게시글 읽기와 정렬
```

## 다음 작업

- 프로필과 GitHub 링크 확정
- 카테고리 필터 또는 검색 추가
- 실제 글 검수 후 공개
