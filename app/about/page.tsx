import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개",
  description: "프론트엔드 개발자 박시현의 관심 분야와 프로젝트",
};

export default function AboutPage() {
  return (
    <main>
      <section className="page-hero shell">
        <p className="eyebrow">About me</p>
        <h1 className="page-title">안녕하세요, 박시현입니다.</h1>
        <p className="page-description">
          화면에 보이는 경험과 그 뒤에서 움직이는 데이터의 흐름을 함께
          이해하는 개발자가 되고 있습니다.
        </p>
      </section>

      <section className="page-content shell">
        <div className="about-grid">
          <aside>
            <p className="about-label">HUFS Computer Engineering</p>
            <p className="about-name">박시현</p>
            <p className="about-role">Frontend Developer</p>
          </aside>

          <div className="about-copy">
            <section>
              <h2>제가 중요하게 생각하는 것</h2>
              <p>
                기능을 빠르게 만드는 데서 끝내지 않고, 왜 이 구조를
                선택했는지 설명할 수 있는 개발을 지향합니다. 사용자가
                자연스럽게 이해하는 화면과 팀원이 이어서 작업하기 쉬운
                코드를 만들고 싶습니다.
              </p>
            </section>

            <section>
              <h2>Projects</h2>
              <ul className="project-list">
                <li>
                  <strong>HUFS 독서마라톤</strong>
                  공식 웹서비스의 프론트엔드를 단독으로 개발하고 있습니다.
                </li>
                <li>
                  <strong>Dailog</strong>
                  NestJS와 TypeORM으로 일정 도메인과 반복 일정 API를
                  설계·구현했습니다.
                </li>
                <li>
                  <strong>withChurch</strong>
                  실제 운영되는 교회 웹사이트의 프론트엔드 개발과 배포를
                  경험했습니다.
                </li>
              </ul>
            </section>

            <section>
              <h2>Tech</h2>
              <p>
                React, TypeScript, JavaScript, Node.js, NestJS, Git을 중심으로
                공부하고 프로젝트에 적용하고 있습니다.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
