import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "프로젝트",
  description:
    "프론트엔드와 백엔드 프로젝트에서 맡은 역할과 해결한 문제를 날짜순으로 정리했습니다.",
};

const projects = [
  {
    title: "Dailog",
    date: "2026.07",
    dateTime: "2026-07",
    status: "팀 프로젝트",
    role: "Backend · 일정 도메인 설계 및 구현",
    description:
      "NestJS와 TypeORM으로 일정 등록·조회·수정·삭제 API를 구현했습니다. 반복 일정의 생명주기를 명확히 관리하기 위해 별도 그룹 테이블을 설계하고, 단건과 전체 수정 범위를 나누어 처리했습니다.",
    stack: ["NestJS", "TypeScript", "TypeORM", "PostgreSQL", "Swagger"],
    postHref: "/posts/repeat-schedule-group",
    postLabel: "반복 일정 설계 기록",
  },
  {
    title: "HUFS 독서마라톤",
    date: "2026.06 — 진행 중",
    dateTime: "2026-06",
    status: "공식 웹서비스",
    role: "Frontend · 단독 개발",
    description:
      "한국외국어대학교 글로벌캠퍼스 도서관의 독서마라톤 웹서비스를 개발하고 있습니다. 디자인 기준 수립부터 사용자·관리자 화면 구현, 인증과 API 연동까지 프론트엔드 전반을 맡았습니다.",
    stack: ["React", "TypeScript", "Vite", "React Router"],
    postHref: "/posts/reading-marathon-frontend",
    postLabel: "단독 개발 회고",
  },
  {
    title: "withChurch",
    date: "2026 · 운영 중",
    dateTime: "2026",
    status: "운영 서비스",
    role: "Frontend · 개발 및 배포",
    description:
      "실제로 사용하는 교회 웹사이트의 화면을 구현하고 배포했습니다. 운영 과정에서 생기는 수정 요청을 반영하며, 구현 이후의 유지보수와 배포 흐름까지 경험했습니다.",
    stack: ["React", "JavaScript", "Git", "Deployment"],
    liveHref: "https://withchurch.site/",
  },
] as const;

export default function ProjectsPage() {
  return (
    <main>
      <section className="page-hero shell">
        <p className="eyebrow">Selected projects</p>
        <h1 className="page-title">프로젝트</h1>
        <p className="page-description">
          최근 프로젝트부터 날짜순으로, 맡은 역할과 기술적인 판단을
          정리했습니다.
        </p>
      </section>

      <section className="page-content shell">
        <div className="project-timeline">
          {projects.map((project) => (
            <article className="project-entry" key={project.title}>
              <div className="project-entry-meta">
                <time dateTime={project.dateTime}>{project.date}</time>
                <span>{project.status}</span>
              </div>

              <div className="project-entry-content">
                <p className="project-entry-role">{project.role}</p>
                <h2>
                  {"liveHref" in project ? (
                    <a
                      className="project-title-link"
                      href={project.liveHref}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {project.title} <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    project.title
                  )}
                </h2>
                <p className="project-entry-description">
                  {project.description}
                </p>

                <ul className="project-stack" aria-label={`${project.title} 기술`}>
                  {project.stack.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>

                {"postHref" in project ? (
                  <Link className="project-entry-link" href={project.postHref}>
                    {project.postLabel} <span aria-hidden="true">→</span>
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
