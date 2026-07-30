import type { Metadata } from "next";
import Link from "next/link";
import type { IconType } from "react-icons";
import { LuBraces, LuNetwork } from "react-icons/lu";
import {
  SiCplusplus,
  SiCss,
  SiDiscord,
  SiFigma,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiMysql,
  SiNestjs,
  SiNodedotjs,
  SiNotion,
  SiReact,
  SiTypeorm,
  SiTypescript,
} from "react-icons/si";

export const metadata: Metadata = {
  title: "소개",
  description: "프론트엔드와 백엔드를 경험한 개발자 박시현의 소개",
};

const timeline = [
  {
    date: "2024.03",
    title: "한국외국어대학교 컴퓨터공학부 입학",
  },
  {
    date: "재학 중",
    title: "컴퓨터공학부 학회 TAB 활동",
  },
  {
    date: "UMC 10기",
    title: "University MakeUs Challenge · Node.js",
  },
  {
    date: "운영 중",
    title: "withChurch",
    href: "https://withchurch.site/",
    external: true,
  },
  {
    date: "2026.06 — 진행 중",
    title: "HUFS 독서마라톤",
    href: "https://github.com/HUFS-Reading-Marathon/pagepace-fe",
    external: true,
  },
  {
    date: "2026.07",
    title: "Dailog",
    href: "https://github.com/TEAM-DAILOG/BE",
    external: true,
  },
] as const;

const projects = [
  {
    name: "HUFS 독서마라톤",
    role: "Frontend · 단독 개발",
    href: "https://github.com/HUFS-Reading-Marathon/pagepace-fe",
    external: true,
  },
  {
    name: "Dailog",
    role: "Backend · 일정 도메인",
    href: "https://github.com/TEAM-DAILOG/BE",
    external: true,
  },
  {
    name: "withChurch",
    role: "Frontend · 개발 및 배포",
    href: "https://withchurch.site/",
    external: true,
  },
] as const;

type Skill = {
  name: string;
  level: "상" | "중" | "하";
  icon: IconType;
  href?: string;
};

const technicalSkills: Skill[] = [
  { name: "React", level: "상", icon: SiReact },
  { name: "TypeScript", level: "상", icon: SiTypescript },
  { name: "JavaScript", level: "상", icon: SiJavascript },
  { name: "HTML", level: "상", icon: SiHtml5 },
  { name: "CSS", level: "상", icon: SiCss },
  { name: "Git", level: "상", icon: SiGit },
  { name: "Node.js", level: "중", icon: SiNodedotjs },
  { name: "NestJS", level: "중", icon: SiNestjs },
  { name: "TypeORM", level: "중", icon: SiTypeorm },
  { name: "MySQL", level: "중", icon: SiMysql },
  { name: "C / C++", level: "하", icon: SiCplusplus },
  { name: "자료구조", level: "하", icon: LuNetwork },
  { name: "알고리즘", level: "하", icon: LuBraces },
];

const collaborationTools: Skill[] = [
  {
    name: "GitHub",
    level: "상",
    icon: SiGithub,
    href: "https://github.com/hyuneey2",
  },
  { name: "Figma", level: "중", icon: SiFigma },
  { name: "Notion", level: "상", icon: SiNotion },
  { name: "Discord", level: "상", icon: SiDiscord },
];

function SkillIcon({ skill }: { skill: Skill }) {
  const Icon = skill.icon;
  const content = (
    <>
      <Icon aria-hidden="true" />
      <span className="skill-tooltip" role="tooltip">
        <strong>{skill.name}</strong>
        <span>숙련도 {skill.level}</span>
      </span>
    </>
  );

  if (skill.href) {
    return (
      <a
        className="skill-icon"
        href={skill.href}
        target="_blank"
        rel="noreferrer"
        aria-label={`${skill.name} · 숙련도 ${skill.level} · 새 창에서 열기`}
      >
        {content}
      </a>
    );
  }

  return (
    <span
      className="skill-icon"
      tabIndex={0}
      aria-label={`${skill.name} · 숙련도 ${skill.level}`}
    >
      {content}
    </span>
  );
}

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero shell">
        <h1>
          박시현 <span aria-hidden="true">/</span> <em>#개발자</em>
        </h1>
        <p className="about-hero-intro">안녕하세요, 박시현입니다</p>
      </section>

      <div className="about-layout shell">
        <div className="about-main">
          <section className="about-section" aria-labelledby="timeline-title">
            <div className="about-section-heading">
              <div>
                <p className="about-section-kicker">Experience</p>
                <h2 id="timeline-title">Timeline</h2>
              </div>
            </div>

            <ol className="about-timeline">
              {timeline.map((item) => (
                <li key={`${item.date}-${item.title}`}>
                  <div className="timeline-marker" aria-hidden="true" />
                  <time>{item.date}</time>
                  <h3>
                    {"href" in item ? (
                      <a
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noreferrer" : undefined}
                      >
                        {item.title}
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>
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
                전체 보기 <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="about-projects">
              {projects.map((project, index) => (
                <article key={project.name}>
                  <a
                    href={project.href}
                    target={"external" in project ? "_blank" : undefined}
                    rel={"external" in project ? "noreferrer" : undefined}
                  >
                    <span className="about-project-number" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p>{project.role}</p>
                    <h3>{project.name}</h3>
                    <span className="about-project-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section className="about-section" aria-labelledby="stack-title">
            <div className="about-section-heading">
              <div>
                <p className="about-section-kicker">Capabilities</p>
                <h2 id="stack-title">Stack &amp; Tools</h2>
              </div>
            </div>

            <div className="skill-categories">
              <section className="skill-category" aria-labelledby="tech-title">
                <h3 id="tech-title">기술 스택</h3>
                <ul>
                  {technicalSkills.map((skill) => (
                    <li key={skill.name}>
                      <SkillIcon skill={skill} />
                    </li>
                  ))}
                </ul>
              </section>

              <section className="skill-category" aria-labelledby="tools-title">
                <h3 id="tools-title">협업 · 공유 도구</h3>
                <ul>
                  {collaborationTools.map((skill) => (
                    <li key={skill.name}>
                      <SkillIcon skill={skill} />
                    </li>
                  ))}
                </ul>
              </section>
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
            <h2>박시현</h2>
            <p>#개발자</p>
          </div>

          <section className="profile-detail">
            <h3>Academic</h3>
            <ul>
              <li>
                한국외국어대학교 컴퓨터공학부 재학
                <span>2024 — 현재</span>
              </li>
              <li>
                창원대산고등학교 졸업
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
