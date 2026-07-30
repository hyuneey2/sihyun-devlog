import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "프로젝트",
  description:
    "프론트엔드와 백엔드 프로젝트에서 맡은 역할과 해결한 문제를 날짜순으로 정리했습니다.",
};

export default function ProjectsPage() {
  return (
    <main className="projects-page">
      <section className="projects-hero shell">
        <p className="projects-kicker">Selected work</p>
        <h1>Projects</h1>
      </section>

      <section className="projects-index shell" aria-label="프로젝트 목록">
        <div className="projects-list">
          {projects.map((project) => (
            <article className="project-row" key={project.slug}>
              <Link href={`/projects/${project.slug}`}>
                <div className="project-row-meta">
                  <time dateTime={project.dateTime}>{project.date}</time>
                  <span>{project.status}</span>
                </div>

                <div className="project-row-content">
                  <p className="project-row-role">{project.role}</p>
                  <h2>{project.title}</h2>
                  <p className="project-row-summary">{project.summary}</p>
                  <p
                    className="project-row-stack"
                    aria-label={`${project.title} 기술 스택`}
                  >
                    {project.stack.join(" · ")}
                  </p>
                </div>

                <span className="project-row-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
