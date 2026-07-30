# 박시현 개발 블로그

프로젝트에서 고민하고 해결한 과정을 기록하는 개인 개발 블로그입니다.

## 기술 구성

- Vinext / React / TypeScript
- D1 데이터베이스 기반 게시글 관리
- Tailwind CSS 4

## 로컬 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`의 두 이메일 값을 같은 관리자 이메일로 바꾸면 로컬에서도
`글 관리` 메뉴와 작성 기능을 확인할 수 있습니다. 게시글 테이블과 기존
글 데이터는 첫 실행 시 자동으로 준비됩니다.

## 글 관리

배포된 블로그에서 관리자 계정으로 접속한 뒤 헤더의 `글 관리`를
선택합니다.

- 기존 글 수정 및 삭제
- 새 글 작성
- Markdown 미리보기
- 임시 저장 및 발행
- 카테고리, 태그, 글 주소 관리

## 주요 폴더

```text
app/
  admin/          글 관리 화면
  api/admin/      글 작성·수정·삭제 API
  about/          소개 페이지
  posts/          글 목록과 상세 페이지
components/       공통 화면 컴포넌트
content/posts/    최초 데이터로 이전할 기존 Markdown 글
db/               게시글 데이터베이스 스키마
lib/post-data.ts  게시글 조회와 저장
```
