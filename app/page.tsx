import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { TypingText } from "@/components/TypingText";
import { getPublishedPosts } from "@/lib/post-data";
import { formatPostDate } from "@/lib/post-types";
import { projects } from "@/lib/projects";

export const dynamic = "force-dynamic";

const growthTiers = [
  {
    tier: "Bronze",
    label: "Foundation",
    title: "웹의 기본을 분리해 이해합니다.",
    description:
      "HTML·CSS·JavaScript의 역할을 구분하고, 화면을 이루는 구조와 동작을 먼저 확인합니다.",
  },
  {
    tier: "Gold",
    label: "Product",
    title: "사용자가 만나는 결과까지 완성합니다.",
    description:
      "React로 화면을 구현하고 API·배포 흐름을 연결해 실제로 사용할 수 있는 서비스를 만듭니다.",
  },
  {
    tier: "Silver",
    label: "System",
    title: "데이터가 흐르는 구조를 설계합니다.",
    description:
      "Node.js와 NestJS로 도메인 관계를 정리하고, 프론트엔드가 예측할 수 있는 API를 고민합니다.",
  },
] as const;

const technologyStack = [
  "React",
  "TypeScript",
  "JavaScript",
  "HTML",
  "CSS",
  "Node.js",
  "NestJS",
  "TypeORM",
  "MySQL",
  "PostgreSQL",
] as const;

export default async function Home() {
  const posts = await getPublishedPosts();
  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, 4);

  return (
    <main>
      <section className="hero">
        <div className="hero-inner shell">
          <div className="hero-copy">
            <p className="hero-eyebrow">MD SIHYUN · DEVELOPER</p>
            <h1>
              <span className="hero-lead">
                더 나은 화면과 구조를 고민하는
              </span>
              <TypingText text="개발자 박시현입니다." />
            </h1>
            <p className="hero-description">
              사용자에게 보이는 경험과 그 뒤에서 움직이는 데이터의 흐름을
              함께 이해하며, 오래 유지할 수 있는 서비스를 만듭니다.
            </p>
            <div className="hero-actions">
              <Link className="hero-button hero-button-primary" href="/projects">
                프로젝트 보기
              </Link>
              <Link className="hero-button hero-button-secondary" href="/about">
                소개 보기
              </Link>
            </div>
          </div>

          {featuredPost ? (
            <Link
              className="hero-highlight"
              href={`/posts/${featuredPost.slug}`}
              aria-label={`최신 글: ${featuredPost.title}`}
            >
              <span className="hero-highlight-label">Latest post</span>
              <div className="hero-highlight-meta">
                <span>{featuredPost.category}</span>
                <time dateTime={featuredPost.date}>
                  {formatPostDate(featuredPost.date)}
                </time>
              </div>
              <h2>{featuredPost.title}</h2>
              <p>{featuredPost.description}</p>
              <span className="hero-highlight-link">최신 글 읽기</span>
            </Link>
          ) : null}
        </div>
      </section>

      <div className="home-content shell">
        <section className="section recent-section" id="recent">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Recent posts</p>
              <h2>최근 기록</h2>
            </div>
            <Link className="text-link" href="/posts">
              전체 글 보기
            </Link>
          </div>

          <div className="post-list">
            {recentPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <section className="section home-projects-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Featured projects</p>
              <h2>대표 프로젝트</h2>
            </div>
            <Link className="text-link" href="/projects">
              전체 프로젝트 보기
            </Link>
          </div>

          <div className="home-project-grid">
            {projects.map((project, index) => (
              <Link
                className="home-project-card"
                href={`/projects/${project.slug}`}
                key={project.slug}
              >
                <div className="home-project-card-top">
                  <span className="home-project-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="home-project-status">{project.status}</span>
                </div>
                <p className="home-project-role">{project.role}</p>
                <h3>{project.title}</h3>
                <p className="home-project-summary">{project.summary}</p>
                <ul className="home-project-stack" aria-label="기술 스택">
                  {project.stack.slice(0, 3).map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </section>

        <section className="section growth-section">
          <div className="section-heading growth-section-heading">
            <div>
              <p className="section-kicker">Growth milestones</p>
              <h2>경험을 쌓아 온 방식</h2>
            </div>
            <p>기본기부터 제품과 구조까지, 현재의 개발 기준을 세 단계로 정리했습니다.</p>
          </div>

          <div className="growth-tier-grid">
            {growthTiers.map((item) => (
              <article
                className={`growth-tier-card growth-tier-${item.tier.toLowerCase()}`}
                key={item.tier}
              >
                <div className="growth-tier-heading">
                  <span className="growth-tier-badge">{item.tier}</span>
                  <span>{item.label}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section stack-section">
          <div className="section-heading stack-section-heading">
            <div>
              <p className="section-kicker">Technology</p>
              <h2>기술 스택</h2>
            </div>
            <p>필요한 기술을 목적에 맞게 선택하고 연결합니다.</p>
          </div>

          <ul className="technology-pills" aria-label="기술 스택 목록">
            {technologyStack.map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
        </section>

        <section className="section home-about-section">
          <div className="project-note">
            <div>
              <p className="section-kicker">What I write about</p>
              <h2>완성된 결과보다, 판단한 과정을 기록합니다.</h2>
            </div>
            <div className="project-note-copy">
              <p>
                Dailog의 반복 일정 설계, HUFS 독서마라톤 프론트엔드 개발,
                withChurch 운영 과정에서 만난 문제뿐 아니라 알고리즘,
                React·Node.js를 공부하며 세운 기준도 글로 남깁니다.
              </p>
              <Link className="project-note-link" href="/projects">
                프로젝트 보기
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
