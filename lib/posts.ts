/// <reference types="vite/client" />

import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { parse as parseYaml } from "yaml";

export type PostSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
};

export type Post = PostSummary & {
  content: string;
};

const postSources = import.meta.glob("../content/posts/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

function parsePost(path: string, source: string): Post {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!frontmatter) {
    throw new Error(`게시글 frontmatter를 찾을 수 없습니다: ${path}`);
  }

  const data = parseYaml(frontmatter[1]) as Record<string, unknown>;
  const content = source.slice(frontmatter[0].length);
  const slug = path.split("/").pop()?.replace(/\.md$/, "");

  if (!slug || !data.title || !data.description || !data.date || !data.category) {
    throw new Error(`게시글 메타데이터가 올바르지 않습니다: ${path}`);
  }

  return {
    slug,
    title: String(data.title),
    description: String(data.description),
    date: String(data.date),
    category: String(data.category),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    content,
  };
}

export function getAllPosts(): PostSummary[] {
  return Object.entries(postSources)
    .map(([path, source]) => parsePost(path, source))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      category: post.category,
      tags: post.tags,
    }));
}

export function getPostBySlug(slug: string): Post | undefined {
  const entry = Object.entries(postSources).find(([path]) =>
    path.endsWith(`/${slug}.md`),
  );

  return entry ? parsePost(entry[0], entry[1]) : undefined;
}

export async function renderPostMarkdown(content: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHtml)
    .process(content);

  return result.toString();
}

export function formatPostDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${year}.${month}.${day}`;
}
