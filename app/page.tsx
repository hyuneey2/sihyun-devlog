import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();
  const recentPosts = posts.slice(0, 3);

  return (
    <main>
      <section className="hero shell">
        <div className="hero-copy">
          <h1>
            더 나은 화면과 구조를 고민하는 프론트엔드/백엔드 개발자
            박시현입니다.
          </h1>
        </div>
      </section>

      <section className="section recent-section shell" id="recent">
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

      <section className="section shell">
        <div className="project-note">
          <div>
            <p className="section-kicker">What I write about</p>
            <h2>완성된 결과보다, 판단한 과정을 기록합니다.</h2>
          </div>
          <p>
            Dailog의 반복 일정 설계, HUFS 독서마라톤 프론트엔드 개발,
            withChurch 운영 과정에서 만난 문제와 해결을 글로 남깁니다.
          </p>
        </div>
      </section>
    </main>
  );
}
