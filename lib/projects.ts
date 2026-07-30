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
  date: string;
  dateTime: string;
  status: string;
  role: string;
  summary: string;
  stack: readonly string[];
  tools: readonly string[];
  links: readonly ProjectLink[];
  preview: ProjectPreview;
  troubleshooting: {
    title: string;
    description: string;
    href?: string;
    linkLabel?: string;
  };
  learnings: readonly string[];
};

export const projects: readonly Project[] = [
  {
    slug: "dailog",
    title: "Dailog",
    date: "2026.07",
    dateTime: "2026-07",
    status: "팀 프로젝트",
    role: "Backend · 일정 도메인 설계 및 구현",
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
    troubleshooting: {
      title: "반복 일정의 수정·삭제 범위를 어떻게 구분할 것인가",
      description:
        "첫 일정 ID를 반복 그룹의 기준으로 쓰면 첫 일정 삭제와 전체 수정 시 관계가 불명확해졌습니다. 반복 그룹 테이블을 분리하고 SINGLE·ALL 범위를 명시해 일정과 그룹의 생명주기를 구분했습니다.",
    },
    learnings: [
      "API 구현 전에 데이터의 관계와 삭제 생명주기를 먼저 정의해야 이후의 예외 처리가 단순해진다는 점을 배웠습니다.",
      "프론트엔드가 예측할 수 있는 응답 구조를 만들기 위해 기획·디자인 요구사항을 API 명세와 지속적으로 맞췄습니다.",
    ],
  },
  {
    slug: "reading-marathon",
    title: "HUFS 독서마라톤",
    date: "2026.06 — 진행 중",
    dateTime: "2026-06",
    status: "공식 웹서비스",
    role: "Frontend · 단독 개발",
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
    troubleshooting: {
      title: "로컬에서는 보이지만 배포 빌드에는 없던 파일",
      description:
        "독서 기록 관련 파일명이 ignore 규칙과 충돌해 로컬에서는 동작하지만 원격 빌드에는 포함되지 않는 문제를 확인했습니다. 추적 상태와 규칙을 점검하고 파일 구조를 정리해 환경 간 차이를 해소했습니다.",
      href: "/posts/reading-marathon-frontend",
      linkLabel: "자세한 해결 과정 보기",
    },
    learnings: [
      "화면 구현뿐 아니라 디자인 기준, 데이터 구조, API 연결 순서를 함께 조율해야 단독 개발의 재작업을 줄일 수 있었습니다.",
      "운영될 서비스는 로컬 동작보다 재현 가능한 빌드와 명확한 상태 처리가 더 중요하다는 점을 배웠습니다.",
    ],
  },
  {
    slug: "withchurch",
    title: "withChurch",
    date: "2026 · 운영 중",
    dateTime: "2026",
    status: "운영 서비스",
    role: "Frontend · 개발 및 API 연동",
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
    troubleshooting: {
      title: "운영 중인 화면을 안정적으로 개선하는 방법",
      description:
        "새로운 요청을 반영할 때 기존 사용 흐름과 배포 환경에 미치는 영향을 함께 확인했습니다. 변경 범위를 작게 나누고 실제 화면을 반복 검수하며 운영 중인 서비스의 수정 과정을 경험했습니다.",
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
