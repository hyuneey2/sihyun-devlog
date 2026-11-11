# Markdown 증분 등록과 기존 D1 데이터 보호

`lib/post-seeding.ts`가 `lib/post-data.ts`의 첫 DB 접근에서 실행된다. D1 binding이 없는 Vercel/로컬 렌더링은 기존처럼 Markdown 번들을 읽는다. 이 작업에서는 운영 D1에 연결하거나 데이터를 쓰지 않는다.

- 기존 `initial_markdown_seed_v2`를 보존하되 더 이상 신규 slug 등록을 막는 조건으로 쓰지 않는다.
- 최초 전환 시 기존 v2 DB인지 새 DB인지 별도 ledger에 고정한다. v2에서 이미 처리한 기존 26개 slug는 삭제된 글도 되살리지 않는다.
- 새 slug는 `INSERT OR IGNORE`로 등록한다. 기존 id/slug 소유자의 본문·발행 상태·작성자·시각을 수정하지 않는다.
- `blog_settings`에 slug별 완료 이력을 남긴다. 관리자 수정, slug 변경, 삭제 이후에도 해당 번들 글을 다시 생성하지 않는다.
- 시리즈 순서가 다른 글에 점유되어 있으면 신규 글을 건너뛰고 서버 로그에 slug를 알린다. 충돌 글은 완료로 표시하지 않아 충돌 해결 후 새 isolate에서 재시도할 수 있다.
- 20편씩 D1 atomic batch로 글과 완료 이력을 함께 처리한다. 실패 batch는 롤백되고 다음 요청에서 재시도한다. 성공한 앞 batch는 이력으로 보호된다.
- 같은 isolate의 동시 요청은 초기화 Promise를 공유한다. 여러 isolate는 SQL의 이력 조건과 id/slug 제약으로 중복 등록을 막는다.

관리자 글은 자동 수정하지 않으므로, 관리자가 신규 시리즈와 동일한 순서를 선점했다면 배포 전 충돌 확인과 수동 조정이 필요하다. Markdown 내용 변경은 기존 DB 글에 자동 반영되지 않는다. 이 정책은 관리자 편집 보존을 우선한다.

테스트는 `tests/post-seeding.test.mjs`에서 실제 SQLite에 production SQL을 실행한다. D1 batch 어댑터로 atomic rollback을 재현하며 빈 DB, 기존 v2, 관리자 편집/초안, 삭제, slug 충돌, 시리즈 충돌, 재시도, 동시 초기화, 여러 batch를 검증한다. 실제 Cloudflare 배포를 검증한 결과는 아니다.
