import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectPostList } from "@/components/ProjectPostList";
import { getPublishedPosts } from "@/lib/post-data";
import { getProjectPosts } from "@/lib/project-posts";
import { getProject } from "@/lib/projects";

export const dynamic = "force-dynamic";

type ProjectDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return {};
  }

  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const relatedPosts = getProjectPosts(
    await getPublishedPosts(),
    project.postTag,
  );

  return (
    <main className="project-detail-page">
      <header className="project-detail-hero shell">
        <Link className="project-back-link" href="/projects">
          ← Projects
        </Link>

        <div className="project-detail-heading">
          <div>
            <p className="projects-kicker">{project.status}</p>
            <h1>{project.title}</h1>
            <p className="project-detail-summary">{project.summary}</p>
          </div>

          <div className="project-detail-actions">
            {project.links.map((link) => (
              <a
                className={
                  link.primary
                    ? "project-action project-action-primary"
                    : "project-action"
                }
                href={link.href}
                target="_blank"
                rel="noreferrer"
                key={link.href}
              >
                {link.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>
      </header>

      <section
        className={`project-preview shell project-preview-${project.preview.type}`}
        aria-label={`${project.title} 미리보기`}
      >
        <div className="project-preview-bar" aria-hidden="true">
          <span />
          <span />
          <span />
          <p>{project.title}</p>
        </div>

        {project.preview.type === "live" ? (
          <iframe
            src={project.preview.src}
            title={project.preview.title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.preview.src}
            alt={project.preview.alt}
            className={
              project.preview.fit === "contain"
                ? "project-preview-contain"
                : undefined
            }
          />
        )}
      </section>

      <div className="project-detail-body shell">
        <aside className="project-meta" aria-label="프로젝트 정보">
          <dl>
            <div>
              <dt>Period</dt>
              <dd>{project.date}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>Team</dt>
              <dd>{project.team.join(" · ")}</dd>
            </div>
            <div>
              <dt>Contribution</dt>
              <dd>{project.contribution}</dd>
            </div>
            <div>
              <dt>Stack</dt>
              <dd>{project.stack.join(" · ")}</dd>
            </div>
            <div>
              <dt>Tools</dt>
              <dd>{project.tools.join(" · ")}</dd>
            </div>
          </dl>
        </aside>

        <div className="project-story">
          <section aria-labelledby="troubleshooting-title">
            <p className="projects-kicker">Troubleshooting</p>
            <h2 id="troubleshooting-title">관련 기록</h2>
            <ProjectPostList
              posts={relatedPosts}
              projectTag={project.postTag}
            />
          </section>

          <section aria-labelledby="learnings-title">
            <p className="projects-kicker">What I learned</p>
            <h2 id="learnings-title">이 프로젝트에서 배운 점</h2>
            {project.learnings.map((learning) => (
              <p key={learning}>{learning}</p>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
