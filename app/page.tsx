import Link from "next/link";
import { HeroAurora } from "@/components/HeroAurora";
import { PostCard } from "@/components/PostCard";
import { TypingText } from "@/components/TypingText";
import { getPublishedPosts } from "@/lib/post-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getPublishedPosts();
  const recentPosts = posts.slice(0, 3);

  return (
    <main>
      <section className="hero shell">
        <HeroAurora />
        <div className="hero-copy">
          <h1>
            <span className="hero-lead">
              더 나은 화면과 구조를 고민하는
            </span>
            <TypingText text="프론트엔드/백엔드 개발자 박시현입니다." />
          </h1>
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

        <section className="section home-about-section">
          <div className="project-note">
            <div>
              <p className="section-kicker">What I write about</p>
              <h2>완성된 결과보다, 판단한 과정을 기록합니다.</h2>
            </div>
            <div className="project-note-copy">
              <p>
                실제 서비스를 개발하며 마주한 고민과 해결 방법을 정리합니다. 
                Dailog, HUFS 독서마라톤 등의 프로젝트 경험과 React, Node.js, 
                알고리즘을 공부하며 다진 기술적 기준을 공유합니다.
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
