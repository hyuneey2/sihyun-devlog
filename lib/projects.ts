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
  summary: string;
  stack: readonly string[];
  tools: readonly string[];
  links: readonly ProjectLink[];
  preview: ProjectPreview;
  learnings: readonly string[];
};

export const projects: readonly Project[] = [
  {
    slug: "dailog",
    title: "Dailog",
    postTag: "Dailog",
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
