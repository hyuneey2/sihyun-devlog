/// <reference types="vite/client" />

import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { parse as parseYaml } from "yaml";
import type { PostCategory, PostInput } from "./post-types";

const postSources = import.meta.glob("../content/posts/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

type BundledPost = PostInput & {
  id: string;
  publishedAt: string;
};

function parsePost(path: string, source: string): BundledPost {
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
    id: `seed-${slug}`,
    slug,
    title: String(data.title),
    description: String(data.description),
    category: String(data.category) as PostCategory,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    content,
    status: "published",
    publishedAt: `${String(data.date)}T00:00:00.000Z`,
  };
}

export function getBundledPosts(): BundledPost[] {
  return Object.entries(postSources)
    .map(([path, source]) => parsePost(path, source))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function renderPostMarkdown(content: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHtml)
    .process(content);

  return result.toString();
}
