# LocalLens 개발기

2026-11-10 발행. 서버 72곳과 공개 Snapshot 59곳, 비공개 검증과 배포 상태, 서버 최적화와 브라우저 추정, AI와 자료 조회를 구분했다. 각 글 하단에 PR·고정 commit의 코드·검증 문서 링크가 있다.

| 순서 | 글                                                                                                                            | slug                                        |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 1    | [공공데이터를 지도에 올리기 전에 판정의 기준을 나눴다](../content/posts/locallens-public-data-diagnosis-map.md)               | `locallens-public-data-diagnosis-map`       |
| 2    | [계산이 맞아도 설명이 다르면 다른 정책을 판단하게 된다](../content/posts/locallens-diagnosis-explanation-contract.md)         | `locallens-diagnosis-explanation-contract`  |
| 3    | [What-if 예산을 바꿔도 기준 결과를 잃지 않게 하기](../content/posts/locallens-budget-whatif-state.md)                         | `locallens-budget-whatif-state`             |
| 4    | [서버 최적화가 멈췄을 때 브라우저는 어디까지 추정할 수 있을까](../content/posts/locallens-estimated-simulation-boundaries.md) | `locallens-estimated-simulation-boundaries` |
| 5    | [서버 전체 장애에서 Snapshot을 읽고 입력을 지킨 채 복구하기](../content/posts/locallens-snapshot-fallback-and-recovery.md)    | `locallens-snapshot-fallback-and-recovery`  |
| 6    | [AI 질문을 쓸 수 없을 때 자료 조회로 전환한 범위](../content/posts/locallens-local-data-answers-without-ai.md)                | `locallens-local-data-answers-without-ai`   |
| 7    | [데이터 이용 조건이 Snapshot 파일 구조를 바꿨다](../content/posts/locallens-data-license-shaped-snapshot.md)                  | `locallens-data-license-shaped-snapshot`    |
| 8    | [지역별 계산·파일·장애 테스트가 각각 증명하는 것](../content/posts/locallens-simulation-test-evidence.md)                     | `locallens-simulation-test-evidence`        |
| 9    | [자동 저장의 '저장됨'은 서버가 받아 준 뒤에만 표시하기](../content/posts/locallens-report-autosave-confirmed-state.md)        | `locallens-report-autosave-confirmed-state` |
| 10   | [공유 링크에는 결과 대신 계산 조건을 담았다](../content/posts/locallens-share-query-state-validation.md)                      | `locallens-share-query-state-validation`    |

리브랜딩·정보 페이지는 데이터 진단 글에, 지도 비동기·DRT 식별자는 What-if 글에 통합했다. 현재 시리즈는 코드에서 확인되는 범위를 다루며 미공개 자료 72곳 전체를 운영 정적으로 배포했다는 주장이나 미구현 문서 영구 저장·추정 요약 편집은 포함하지 않는다.
