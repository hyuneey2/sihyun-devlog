---
title: "데이터 이용 조건이 Snapshot 파일 구조를 바꿨다"
description: "공개를 보류한 13곳과 OSM 파생값 분리, 출처 판정표·생성 중단·테스트로 이어진 설계입니다."
date: "2026-11-10"
category: "Frontend"
tags: ["LocalLens", "OpenStreetMap", "ODbL", "Public Data", "Snapshot"]
series: "LocalLens 개발기"
seriesOrder: 7
---

2026년 11월 Snapshot 기능을 검토할 때, 서버 응답을 JSON으로 저장하면 기술적으로는 전체 장애에서도 계산할 수 있었다. 하지만 public/에 넣는 것은 자료를 재배포하는 행위여서 서버 API를 읽는 것과 같은 판단으로 넘길 수 없었다. #16은 비공개 전체본으로 검증한 코드였고, #17에서 공개 범위와 파일 형식을 바꿨다.

## 공개 여부가 테스트 지역 수와 달랐다

비공개 전체 수집본은 72곳이다. 공개본은 59곳, 마을 6,270곳과 시설 2,918곳이다. 나머지 13곳은 시간표·경로당 등 자료의 이용 조건 표시가 다르거나 확인이 부족해 정적 자료에서 제외했다.

이 숫자는 데이터가 없는 지역 수가 아니다. 서버 정상일 때는 기존 72곳을 이용하며, 전체 장애 때 13곳은 미지원으로 알린다. 공개 파일에 이름·코드·시도만 남기고 해당 지역의 상세 데이터 파일을 만들지 않는 구조다.

## OSM에 의존하는 칸은 따로 옮겼다

원래 통합 파일을 공공데이터 부분과 OSM 파생 부분으로 나눴다. 마을 전체 좌표, 버스 값, 가까운 시설 계산, 시설의 마을 연결, 중심 좌표와 일부 지표 등 OSM 의존값을 osm/에 둔다. 인구·시설 속성·행정 경계·출처 등은 원자료 조건을 유지하는 파일에 둔다.

```text
<지역>.json: 공공데이터 칸 + 출처
osm/<지역>.json: OSM 의존 칸 + ODbL 고지
→ 법정리 코드·시설 id로 mergeRegion
→ 앱이 쓰는 같은 RegionData
```

프로젝트는 OSM 의존 가능성이 있는 값을 넓게 분리하는 방식을 선택했다. ODbL은 DB와 개별 내용물의 권리를 구분하고, OSMF 공동 DB 지침도 결합 데이터의 독립성을 설명한다. 다만 파일을 둘로 나누었다는 사실만으로 이 프로젝트의 법률 판단이 자동 확정되는 것은 아니다.

data-licenses 문서는 OSRM 시간값의 성격, 공공데이터 재배포 표시, 공동 DB 해석 등을 프로젝트의 판단으로 남긴다. 여기서는 그 판단에 따라 어떤 파일·출력 경로를 바꿨는지 기록한다.

## 문서를 코드의 중단 조건으로 만들었다

scripts/snapshot-sources.json은 출처별 공개/보류 판단을 담는다. make-public-snapshot은 표에 없는 출처나 hold 출처를 쓰는 지역이 생기거나 보류 목록이 달라지면 저장하지 않고 중단한다. 자동으로 더 넓은 범위를 공개하지 않도록 했다.

public-snapshot.test는 보류 지역의 공공데이터·OSM 파일이 모두 없는지, 공개본의 출처에 미확인 조건이 섞이지 않았는지, 공공데이터 파일에 OSM 칸이 남지 않았는지를 확인한다. 문자열 검사만으로 법적 허용을 증명하는 테스트가 아니라, 정한 공개 정책을 코드가 어기지 않게 하는 검사다.

파일마다 라이선스·출처 고지를 남기고 화면의 OSM 고지와 파생 자료 다운로드 경로를 제공한다. SHA-256은 읽는 파일의 무결성에 쓰며 이용자의 별도 사용 권한을 제한하는 장치로 쓰지 않는다.

## 분리 뒤에도 같은 계산인가

공개 두 파일을 합친 값이 비공개 전체본의 해당 지역 값과 같은지 비교했다. 판정·대안·민감도·취약도·마을 카드도 비교해, 이용 조건 때문에 저장 형태를 바꾼 일이 계산값까지 바꾸지 않도록 했다.

#17과 문서에는 2026-11-07의 59곳 서버 대조 기록이 있다. 당시 로컬 Cloudflare 런타임 검증이며 운영 CDN 배포 완료를 의미하지 않는다. 서버 정상 시 제공되는 나머지 13곳의 ODbL 의무 충족과 일부 출처 해석은 여전히 판단이 남아 있다. 이번 프론트 변경으로 운영 API의 모든 이용 조건 문제가 해결됐다고 쓰지 않는다.

## 참고한 변경과 코드

- [PR #17 · 공개 범위와 남은 판단](https://github.com/ai-life-challenge/ai-life-FE/pull/17)
- [이용 조건 조사 문서](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/docs/data-licenses.md)
- [출처별 판정표](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/scripts/snapshot-sources.json)
- [공개 생성 중단 조건](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/scripts/make-public-snapshot.mjs)
- [공개본 검사](https://github.com/ai-life-challenge/ai-life-FE/blob/aef02eb3b3e3cc14601c8f24147a69ef1d1e2c25/scripts/public-snapshot.test.ts)
- [ODbL 1.0 원문](https://opendatacommons.org/licenses/odbl/1-0/)
- [OSMF 공동 DB 지침](https://osmfoundation.org/wiki/Licence/Community_Guidelines/Collective_Database_Guideline_Guideline)
