import Link from "next/link";
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
        <div className="hero-copy">
          <div className="home-avatar" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/sihyun-profile.png" alt="" width="72" height="72" />
          </div>
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
              전체 글 보기 <span aria-hidden="true">→</span>
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
                Dailog의 반복 일정 설계, HUFS 독서마라톤 프론트엔드 개발,
                withChurch 운영 과정에서 만난 문제뿐 아니라 알고리즘,
                React·Node.js를 공부하며 세운 기준도 글로 남깁니다.
              </p>
              <Link className="project-note-link" href="/projects">
                프로젝트 보기 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
