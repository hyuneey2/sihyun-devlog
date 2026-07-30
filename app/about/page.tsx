import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "소개",
  description:
    "화면에 보이는 경험과 데이터의 흐름을 함께 이해하는 개발자 박시현의 소개와 경험",
};

const timeline = [
  {
    date: "2024.03",
    title: "한국외국어대학교 컴퓨터공학부 입학",
    description:
      "컴퓨터공학의 기초를 쌓으며 웹 개발과 사용자 경험에 관심을 넓혔습니다.",
  },
  {
    date: "재학 중",
    title: "컴퓨터공학부 학회 TAB 활동",
    description:
      "HTML·CSS·JavaScript부터 React와 알고리즘까지 함께 학습하고 기록했습니다.",
  },
  {
    date: "UMC 10기",
    title: "University MakeUs Challenge",
    description:
      "Node.js 파트에서 서버 구조와 API 설계를 학습하며 프론트엔드 너머의 데이터 흐름을 익혔습니다.",
  },
  {
    date: "운영 중",
    title: "withChurch",
    description:
      "실제로 운영되는 교회 웹사이트의 프론트엔드 개발과 배포, 유지보수를 경험했습니다.",
  },
  {
    date: "2026.06 — 진행 중",
    title: "HUFS 독서마라톤",
    description:
      "한국외국어대학교 글로벌캠퍼스 도서관 공식 웹서비스의 프론트엔드를 단독으로 개발하고 있습니다.",
  },
  {
    date: "2026.07",
    title: "Dailog",
    description:
      "NestJS와 TypeORM으로 일정 도메인 및 반복 일정 API를 설계·구현했습니다.",
  },
] as const;

const projects = [
  {
    name: "HUFS 독서마라톤",
    role: "Frontend · 단독 개발",
    summary:
      "사용자·관리자 화면부터 인증 및 API 연동까지 프론트엔드 전반을 담당했습니다.",
  },
  {
    name: "Dailog",
    role: "Backend · 일정 도메인",
    summary:
      "반복 일정의 생명주기를 고려해 그룹 구조와 단건·전체 수정 범위를 설계했습니다.",
  },
  {
    name: "withChurch",
    role: "Frontend · 개발 및 배포",
    summary:
      "운영 중인 서비스의 화면을 구현하고 실제 사용 과정의 수정 요청을 반영했습니다.",
  },
] as const;

const skillGroups = [
  {
    level: "High",
    levelKo: "상",
    description: "프로젝트에서 주도적으로 사용",
    technologies: ["React", "TypeScript", "JavaScript", "HTML/CSS", "Git/GitHub"],
  },
  {
    level: "Mid",
    levelKo: "중",
    description: "구현 경험을 바탕으로 활용",
    technologies: ["Node.js", "NestJS", "TypeORM", "Figma", "Notion"],
  },
  {
    level: "Basic",
    levelKo: "하",
    description: "기초를 학습하고 꾸준히 확장",
    technologies: ["C/C++", "자료구조/알고리즘"],
  },
] as const;

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero shell">
        <p className="eyebrow">About me</p>
        <h1>
          화면에 보이는 경험과
          <br />
          그 뒤에서 움직이는 데이터의 흐름을
          <br />
          함께 이해하는 개발자
        </h1>
        <p className="about-hero-description">
          사용자가 마주하는 화면부터 서비스가 동작하는 구조까지,
          <br />
          연결된 흐름을 이해하고 더 나은 구현을 고민합니다.
        </p>
      </section>

      <div className="about-layout shell">
        <div className="about-main">
          <section className="about-section about-intro">
            <p className="about-section-kicker">Values</p>
            <h2>경험과 구조를 함께 봅니다.</h2>
            <div className="about-intro-copy">
              <p>
                기능을 빠르게 만드는 데서 끝내지 않고, 왜 이 구조를
                선택했는지 설명할 수 있는 개발을 지향합니다.
              </p>
              <p>
                프론트엔드와 백엔드를 모두 경험하며 사용자가 자연스럽게
                이해하는 화면과 팀원이 이어서 작업하기 쉬운 코드를 만들기
                위해 고민해 왔습니다. 학습한 내용은 프로젝트에 적용하고,
                선택의 근거와 해결 과정을 기록으로 남깁니다.
              </p>
            </div>
          </section>

          <section className="about-section" aria-labelledby="timeline-title">
            <div className="about-section-heading">
              <div>
                <p className="about-section-kicker">Experience</p>
                <h2 id="timeline-title">Timeline</h2>
              </div>
              <p>배움이 프로젝트로 이어진 과정입니다.</p>
            </div>

            <ol className="about-timeline">
              {timeline.map((item) => (
                <li key={`${item.date}-${item.title}`}>
                  <div className="timeline-marker" aria-hidden="true" />
                  <time>{item.date}</time>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="about-section" aria-labelledby="projects-title">
            <div className="about-section-heading">
              <div>
                <p className="about-section-kicker">Selected work</p>
                <h2 id="projects-title">Projects</h2>
              </div>
              <Link className="about-section-link" href="/projects">
                전체 프로젝트 <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="about-projects">
              {projects.map((project, index) => (
                <article key={project.name}>
                  <span className="about-project-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p>{project.role}</p>
                  <h3>{project.name}</h3>
                  <p className="about-project-summary">{project.summary}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="about-section" aria-labelledby="stack-title">
            <div className="about-section-heading">
              <div>
                <p className="about-section-kicker">Capabilities</p>
                <h2 id="stack-title">Tech Stack</h2>
              </div>
              <p>현재 프로젝트 활용 경험을 기준으로 구분했습니다.</p>
            </div>

            <div className="skill-groups">
              {skillGroups.map((group) => (
                <section
                  className={`skill-group skill-group-${group.level.toLowerCase()}`}
                  key={group.level}
                >
                  <div className="skill-level">
                    <span>{group.level}</span>
                    <strong>{group.levelKo}</strong>
                    <p>{group.description}</p>
                  </div>
                  <ul aria-label={`${group.level} 숙련도 기술`}>
                    {group.technologies.map((technology) => (
                      <li key={technology}>{technology}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </section>
        </div>

        <aside className="profile-sidebar" aria-label="박시현 프로필">
          <div className="profile-photo-wrap">
            {/* Vinext preview does not support Next.js image optimization. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sihyun-profile.png"
              alt="박시현 프로필 사진"
              width="1151"
              height="2048"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>

          <div className="profile-identity">
            <p className="profile-overline">Profile</p>
            <h2>박시현</h2>
            <p>Frontend / Backend Developer</p>
          </div>

          <section className="profile-detail">
            <h3>Academic</h3>
            <ul>
              <li>
                <span>2024 — 현재</span>
                한국외국어대학교
                <br />
                컴퓨터공학부 재학
              </li>
              <li>
                <span>졸업</span>
                창원대산고등학교
              </li>
            </ul>
          </section>

          <section className="profile-detail profile-contact">
            <h3>Contact</h3>
            <dl>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href="tel:+821026949314">010-2694-9314</a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href="mailto:tlgus0929@hufs.ac.kr">
                    tlgus0929@hufs.ac.kr
                  </a>
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </main>
  );
}
