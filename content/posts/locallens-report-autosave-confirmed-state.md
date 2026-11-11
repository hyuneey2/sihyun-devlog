---
title: "자동 저장의 '저장됨'은 서버가 받아 준 뒤에만 표시하기"
description: "TipTap 문서 편집, 직렬 저장, 로컬 초안과 서버 수락 상태, PDF·추정 요약의 경계를 다룹니다."
date: "2026-11-10"
category: "Frontend"
tags: ["LocalLens", "TipTap", "ProseMirror", "Autosave", "React"]
series: "LocalLens 개발기"
seriesOrder: 9
---

LocalLens의 보고서는 서버가 공문 초안과 계산 내용을 만들고, 사용자가 일부 문단을 문서 안에서 고칠 수 있다. 2026년 10~11월의 현재 Report, autosave, reportSaver와 테스트를 읽으며, 편집기에 글이 보이는 상태와 저장이 확인된 상태를 구분한 흐름을 정리했다. #13은 기존 자동 저장·편집 구현과 진단 변경을 통합한 PR이며 모든 편집 기능을 그 PR 하나에서 처음 만든 것은 아니다.

## 서버가 문서를 영구 보관하는 구조가 아니다

POST /report는 현재 State와 편집한 sections로 보고서를 다시 만든다. 독립 문서 DB에 저장되는 것과 다르다. 서버가 받아 준 편집 문단과 아직 못 보낸 초안은 지역별 localStorage에 남겨 새로고침 때 복원한다.

```text
TipTap 입력 → local
       → 직렬 send → 서버 수락 → confirmed
localStorage: 수락한 sections + 아직 못 보낸 drafts
```

브라우저 저장을 쓸 수 없는 경우와 저장한 글이 없는 경우도 구분한다. 로컬 저장 실패가 서버 요청 자체를 막지는 않지만, 다른 기기에서도 문서를 복구할 수 있다는 보장은 없다.

## 요청 중에도 사용자는 계속 입력한다

Autosave는 confirmed, local, inflight를 분리한다. 기본 700ms 동안 입력이 멈추면 보내거나 blur 등에서 flush한다. 이미 요청 중이면 새 요청을 겹치지 않고, 성공한 뒤 아직 다른 최신 글이 있으면 이어서 보낸다.

A1을 전송하는 동안 A2로 고쳤다면 A1 응답은 confirmed만 A1로 만들고, 화면의 A2를 덮지 않아야 한다. debounce만으로는 응답 순서가 뒤집히는 문제를 막지 못하므로 한 번에 하나의 send라는 조건이 필요했다.

저장 실패 시 글을 그대로 두고 error와 재시도를 제공한다. 서버가 수락하기 전에는 saved로 표시하지 않는다. 새 서버 본문을 base로 받더라도 아직 dirty인 문단은 덮지 않는다.

## 되돌리기도 저장 요청이다

null은 '편집한 글을 버리고 서버 초안으로'라는 값이다. 요청 중 되돌리기를 누르면 먼저 요청이 끝나기를 기다린다. 되돌리기 저장까지 실패하면 이전 로컬 글을 복원하고 오류를 남긴다. 실패한 null이 나중에 저절로 전송되어 사용자의 글이 사라지지 않도록 하는 흐름이다.

빈 문단·1,500자 초과는 해당 문단 전송을 막되 유효한 다른 문단은 저장할 수 있다. 화면의 문서 상태를 한 덩어리 성공/실패로만 다루지 않는다.

## 편집 가능한 영역을 제한했다

RichText는 TipTap/ProseMirror로 서식이 있는 본문 편집을 담당한다. 문단 제목·비교표·각주는 계산·출처에 연결되어 사용자가 임의 편집하는 영역과 구분한다. 모든 보고서 요소를 자유로운 워드 문서처럼 바꾸는 기능은 아니다.

store.saveSections는 응답 뒤에도 지역과 계산 조건을 확인한다. 같은 조건이면 보고서를 교체하고 이전 요청을 취소한다. 저장 중 예산·선택안이 바뀌었다면 편집 글만 현재 State에 반영하고 새 조건의 보고서를 다시 받게 한다.

## PDF와 장애 요약의 의미

PDF 버튼은 window.print를 사용해 브라우저의 인쇄·PDF 저장을 연다. 서버가 PDF 파일을 생성해 영구 보관하는 기능이 아니다. 공유 링크는 계산 조건을 담지만 직접 고친 문단은 포함하지 않는다.

대안이 estimated이면 서버 공문·각주·문단 편집을 흉내 내지 않고 EstimatedSummary를 보여 준다. 계산 조건·대안·배치·근거·출처를 요약하고 PDF·링크를 지원하지만 이 요약의 로컬 편집은 만들지 않았다.

autosave.test는 수동 resolve/reject 서버와 fake timer로 입력 debounce, 전송 중 수정, 실패 재시도, 되돌리기 실패, 새 base에 의한 초안 보존을 검사한다. 이것은 순수 저장 순서의 근거이며 모든 브라우저의 PDF 결과와 서버 문구 품질까지 검증한 테스트는 아니다.

## 참고한 변경과 코드

- [PR #13 · 보고서 코드 통합](https://github.com/ai-life-challenge/ai-life-FE/pull/13)
- [보고서 화면](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/src/screens/Report.tsx)
- [자동 저장 로직](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/src/screens/report/autosave.ts)
- [지역별 브라우저 보관](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/src/screens/report/reportSaver.ts)
- [저장 경합 테스트](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/src/screens/report/autosave.test.ts)
- [TipTap 편집기](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/src/ui/RichText.tsx)
- [서버 수락 이후 상태 갱신](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/src/store.ts)
