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
          <p className="eyebrow">Frontend · Backend · Project Notes</p>
          <h1>
            배운 것을
            <br />
            기록으로 남깁니다.
          </h1>
          <p className="hero-description">
            사용자와 가까운 화면부터 데이터 흐름까지, 직접 고민하고
            구현하며 배운 내용을 정리하는 박시현의 개발 블로그입니다.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="#recent">
              최근 글 보기
            </Link>
            <Link className="button button-secondary" href="/about">
              소개 보기
            </Link>
          </div>
        </div>

        <aside className="now-card" aria-label="현재 관심 분야">
          <p className="now-label">Currently exploring</p>
          <p className="now-title">좋은 화면 뒤의 구조</p>
          <p className="now-description">
            React로 사용자 경험을 만들고, NestJS와 API 설계로 서비스의
            흐름을 이해하고 있습니다.
          </p>
          <div className="now-tags" aria-label="기술 태그">
            <span>React</span>
            <span>TypeScript</span>
            <span>NestJS</span>
          </div>
        </aside>
      </section>

      <section className="section shell" id="recent">
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
