export type ProjectLink = {
  label: string;
  href: string;
  primary?: boolean;
};

type ProjectPreview =
  | {
      type: "live";
      src: string;
      title: string;
    }
  | {
      type: "image";
      src: string;
      alt: string;
      fit?: "cover" | "contain";
    };

export type Project = {
  slug: string;
  title: string;
  postTag: string;
  date: string;
  dateTime: string;
  status: string;
  role: string;
  team: readonly string[];
  contribution: string;
  summary: string;
  stack: readonly string[];
  tools: readonly string[];
  links: readonly ProjectLink[];
  preview: ProjectPreview;
  learnings: readonly string[];
};

export const projects: readonly Project[] = [
  {
    slug: "locallens",
    title: "LocalLens — 농어촌 공공서비스 접근성 분석 및 예산 시뮬레이션",
    postTag: "LocalLens",
    date: "2026.10 — 2026.11",
    dateTime: "2026-10",
    status: "2026 AI 라이프 솔루션 챌린지",
    role: "Frontend · 요구사항 정리 및 UI·API 검증",
    team: ["AI 라이프 솔루션 챌린지 팀 프로젝트", "프론트엔드 · 서버 협업"],
    contribution: "진단 UI · 시뮬레이션 상태 · 장애 대응 및 테스트",
    summary:
      "공공데이터로 전국 72개 지역의 의료·교통 접근성을 진단하고 예산과 정책 목표에 따른 공급 대안을 비교하는 의사결정 지원 웹 서비스입니다. AI 데이터 질의응답과 정책 보고서를 지원하며, 백엔드 전체 장애 시 공개 정적 자료가 있는 59개 지역에서 브라우저 추정 계산을 제공합니다. 나머지 13개 지역은 서버 정상 시 지원합니다.",
    stack: [
      "React",
      "TypeScript",
      "Vite",
      "Zustand",
      "MapLibre GL",
      "deck.gl",
      "React Router",
      "TipTap",
      "Vitest",
      "Cloudflare Workers",
    ],
    tools: ["GitHub", "REST API", "브라우저 개발자 도구", "Wrangler"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ai-life-challenge/ai-life-FE",
        primary: true,
      },
    ],
    preview: {
      type: "image",
      src: "/projects/locallens-introduction.svg",
      alt: "LocalLens 공식 위치 핀을 활용한 소개 그래픽: 진단·예산 비교·보고서, 실제 화면 캡처 아님",
      fit: "cover",
    },
    learnings: [
      "계산식과 지도 범례, 시설 필터, 기준 인구의 설명을 맞추고 공공 기준과 팀 가정값을 구분했습니다. 화면 설명도 정책 판단에 영향을 주는 데이터 계약이었습니다.",
      "서버 CP-SAT 최적화와 브라우저 추정의 출처를 구분하고, 장애·복구 중에도 예산과 What-if 입력을 유지하도록 상태 흐름을 검토했습니다. 서버 최적화 알고리즘 구현은 담당 범위가 아닙니다.",
      "공개 자료 59곳과 미지원 13곳을 분리하고 OSM 파생값을 별도 파일로 제공했습니다. SHA-256·구조 검사와 장애 시나리오 테스트를 통해 잘못된 값으로 결과를 채우지 않도록 했습니다.",
    ],
  },
  {
    slug: "unstiff",
    title: "찌뿌두둥 (Unstiff)",
    postTag: "Unstiff",
    date: "2026.08 — 2026.10",
    dateTime: "2026-08",
    status: "SWYP 6기 팀 프로젝트",
    role: "Frontend · 모바일 앱 개발 및 API 연동",
    team: ["SWYP 6기 8팀", "기획 · 디자인 · 프론트엔드 · 백엔드 협업"],
    contribution: "온보딩 · 운동 기록 · 플랫폼 대응 및 QA",
    summary:
      "일상 속 운동 기록과 개인화된 운동 미션을 연결하는 React Native 기반 iOS·Android 앱입니다. 온보딩, 운동 계획·기록 API, 사진 촬영·업로드, 알림 연동과 플랫폼별 UI 개선에 참여했습니다.",
    stack: [
      "React Native",
      "Expo Router",
      "TypeScript",
      "NativeWind",
      "Zustand",
      "Axios",
      "Firebase",
    ],
    tools: [
      "GitHub",
      "Figma",
      "Xcode",
      "CocoaPods",
      "Android Studio",
      "Cloudflare",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/swyp6/unstiff-app",
        primary: true,
      },
    ],
    preview: {
      type: "image",
      src: "/projects/unstiff-onboarding.png",
      alt: "Unstiff PR #56에 첨부된 회원가입 온보딩 실제 화면",
      fit: "contain",
    },
    learnings: [
      "HealthKit·Health Connect와 Kakao Native SDK의 초기 연동을 맡으며 JS 패키지와 네이티브 빌드의 경계를 확인했습니다. 이 초기 모듈들은 현재 develop에서 제거되어 있으며, 당시 구현과 검증 범위는 개발기에 구분해 기록했습니다.",
      "촬영·업로드·기록 저장을 연결할 때 화면 이동과 비동기 작업의 완료 시점, 표시용 제목과 서버 식별자를 따로 관리해야 했습니다.",
      "키보드·Safe Area·시스템 카메라처럼 OS에 의존하는 기능은 정적 검사와 실제 기기 확인을 구분해 검증했습니다.",
    ],
  },
  {
    slug: "dailog",
    title: "Dailog",
    postTag: "Dailog",
    date: "2026.07",
    dateTime: "2026-07",
    status: "팀 프로젝트",
    role: "Backend · 일정 도메인 설계 및 구현",
    team: ["Frontend 4명", "Backend 4명", "PM 1명", "Designer 1명"],
    contribution: "Backend · 60%",
    summary:
      "일정 관리와 일기 작성을 하나로 연결한 앱입니다. 일정 도메인과 반복 일정 API의 구조를 설계하고 구현했습니다.",
    stack: ["NestJS", "TypeScript", "TypeORM", "PostgreSQL", "Swagger"],
    tools: ["GitHub", "Notion", "Swagger"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/TEAM-DAILOG/BE",
        primary: true,
      },
    ],
    preview: {
      type: "image",
      src: "/projects/dailog.png",
      alt: "Dailog 모바일 앱의 일정 관리와 일기 작성 화면 목업",
      fit: "contain",
    },
    learnings: [
      "API 구현 전에 데이터의 관계와 삭제 생명주기를 먼저 정의해야 이후의 예외 처리가 단순해진다는 점을 배웠습니다.",
      "프론트엔드가 예측할 수 있는 응답 구조를 만들기 위해 기획·디자인 요구사항을 API 명세와 지속적으로 맞췄습니다.",
    ],
  },
  {
    slug: "reading-marathon",
    title: "HUFS 독서마라톤",
    postTag: "독서마라톤",
    date: "2026.06 — 진행 중",
    dateTime: "2026-06",
    status: "공식 웹서비스",
    role: "Frontend · 단독 개발",
    team: ["Frontend 1명", "Backend 1명"],
    contribution: "Frontend · 100%",
    summary:
      "한국외국어대학교 글로벌캠퍼스 도서관의 독서 기록 프로그램을 위한 공식 웹서비스입니다. 사용자와 관리자 화면의 설계·구현을 맡았습니다.",
    stack: ["React", "TypeScript", "Vite", "React Router"],
    tools: ["GitHub", "Figma", "Notion"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/HUFS-Reading-Marathon/pagepace-fe",
        primary: true,
      },
    ],
    preview: {
      type: "image",
      src: "/projects/reading-marathon.png",
      alt: "HUFS 독서마라톤 웹서비스 메인 화면",
      fit: "cover",
    },
    learnings: [
      "화면 구현뿐 아니라 디자인 기준, 데이터 구조, API 연결 순서를 함께 조율해야 단독 개발의 재작업을 줄일 수 있었습니다.",
      "운영될 서비스는 로컬 동작보다 재현 가능한 빌드와 명확한 상태 처리가 더 중요하다는 점을 배웠습니다.",
    ],
  },
  {
    slug: "withchurch",
    title: "withChurch",
    postTag: "withchurch",
    date: "2026 · 운영 중",
    dateTime: "2026",
    status: "운영 서비스",
    role: "Frontend · 개발 및 API 연동",
    team: ["Frontend 3명", "Backend 1명"],
    contribution: "Frontend · 90%",
    summary:
      "교회 소식과 기록을 온라인에서 공유할 수 있는 커뮤니티형 웹페이지입니다. 실제 사용 환경에 배포한 뒤 운영 요청을 반영하고 있습니다.",
    stack: ["React", "JavaScript", "REST API"],
    tools: ["GitHub", "Figma"],
    links: [
      {
        label: "사이트 방문",
        href: "https://withchurch.site/",
        primary: true,
      },
      {
        label: "GitHub",
        href: "https://github.com/withChurch",
      },
    ],
    preview: {
      type: "live",
      src: "https://withchurch.site/",
      title: "withChurch 실제 운영 사이트 미리보기",
    },
    learnings: [
      "서비스는 배포로 끝나지 않으며, 실제 사용자의 요청을 빠르게 이해하고 기존 흐름을 지키며 반영하는 과정이 중요했습니다.",
      "API 연동과 배포를 직접 맡으며 프론트엔드 코드가 운영 환경에서 동작하기까지의 전체 흐름을 익혔습니다.",
    ],
  },
] as const;

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
