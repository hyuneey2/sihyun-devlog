import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const postsDirectory = path.join(repositoryRoot, "content", "posts");
const defaultD1StateDirectory = path.join(
  repositoryRoot,
  ".wrangler",
  "state",
  "v3",
  "d1",
  "miniflare-D1DatabaseObject",
);
const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseArguments(arguments_) {
  const options = { database: undefined, dryRun: false };

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];

    if (argument === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (argument === "--database") {
      const database = arguments_[index + 1];
      if (!database) {
        throw new Error("--database 다음에 SQLite 파일 경로를 입력해 주세요.");
      }
      options.database = path.resolve(repositoryRoot, database);
      index += 1;
      continue;
    }

    throw new Error(`지원하지 않는 옵션입니다: ${argument}`);
  }

  return options;
}

function readD1Connection() {
  const configPath = path.join(repositoryRoot, "wrangler.local.jsonc");

  if (!fs.existsSync(configPath)) {
    throw new Error(`로컬 D1 설정을 찾지 못했습니다: ${configPath}`);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    throw new Error(`로컬 D1 설정을 읽지 못했습니다: ${configPath}`, {
      cause: error,
    });
  }

  const connection = config.d1_databases?.find(
    (database) => database.binding === "DB",
  );
  if (!connection?.database_name) {
    throw new Error(
      `wrangler.local.jsonc에서 DB 바인딩의 database_name을 찾지 못했습니다: ${configPath}`,
    );
  }

  return {
    binding: connection.binding,
    configPath,
    databaseName: connection.database_name,
  };
}

function hasPostsTable(databasePath) {
  let database;
  try {
    database = new DatabaseSync(databasePath, { readOnly: true });
    return Boolean(
      database
        .prepare(
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'posts'",
        )
        .get(),
    );
  } catch {
    return false;
  } finally {
    database?.close();
  }
}

function findDatabase(explicitDatabase) {
  if (explicitDatabase) {
    if (!fs.existsSync(explicitDatabase)) {
      throw new Error(`지정한 SQLite 파일을 찾지 못했습니다: ${explicitDatabase}`);
    }
    if (!hasPostsTable(explicitDatabase)) {
      throw new Error(
        `지정한 SQLite 파일에 posts 테이블이 없습니다: ${explicitDatabase}`,
      );
    }
    return explicitDatabase;
  }

  if (!fs.existsSync(defaultD1StateDirectory)) {
    throw new Error(
      `로컬 D1 저장 디렉터리를 찾지 못했습니다: ${defaultD1StateDirectory}`,
    );
  }

  const candidates = fs
    .readdirSync(defaultD1StateDirectory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(".sqlite") &&
        entry.name !== "metadata.sqlite",
    )
    .map((entry) => path.join(defaultD1StateDirectory, entry.name));
  const databases = candidates.filter(hasPostsTable);

  if (databases.length === 0) {
    throw new Error(
      [
        "posts 테이블이 있는 로컬 D1 SQLite 파일을 찾지 못했습니다.",
        `확인한 디렉터리: ${defaultD1StateDirectory}`,
        `확인한 파일: ${candidates.length ? candidates.join(", ") : "없음"}`,
      ].join("\n"),
    );
  }
  if (databases.length > 1) {
    throw new Error(
      [
        "posts 테이블이 있는 SQLite 파일이 여러 개라 원본을 결정할 수 없습니다.",
        ...databases.map((database) => `- ${database}`),
        "--database <path> 옵션으로 원본 파일을 지정해 주세요.",
      ].join("\n"),
    );
  }

  return databases[0];
}

function parseTags(value, slug) {
  let tags;
  try {
    tags = JSON.parse(value);
  } catch (error) {
    throw new Error(`${slug}의 tags가 올바른 JSON이 아닙니다.`, {
      cause: error,
    });
  }

  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string")) {
    throw new Error(`${slug}의 tags는 문자열 배열이어야 합니다.`);
  }

  return tags;
}

function buildFrontmatter(row) {
  if (!slugPattern.test(row.slug)) {
    throw new Error(
      `${row.slug}의 slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.`,
    );
  }
  if (!row.title || !row.description || !row.category) {
    throw new Error(`${row.slug}의 필수 메타데이터가 비어 있습니다.`);
  }

  const date = String(row.published_at ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`${row.slug}의 published_at이 올바르지 않습니다.`);
  }

  const hasSeries = typeof row.series === "string" && row.series.trim() !== "";
  const hasSeriesOrder = row.series_order !== null;
  if (hasSeries !== hasSeriesOrder) {
    throw new Error(
      `${row.slug}의 series와 series_order는 함께 존재하거나 함께 비어 있어야 합니다.`,
    );
  }
  if (
    hasSeriesOrder &&
    (!Number.isInteger(row.series_order) || row.series_order < 1)
  ) {
    throw new Error(`${row.slug}의 series_order는 1 이상의 정수여야 합니다.`);
  }

  const frontmatter = {
    title: row.title,
    description: row.description,
    date,
    category: row.category,
  };
  if (hasSeries) {
    frontmatter.series = row.series.trim();
    frontmatter.seriesOrder = row.series_order;
  }
  frontmatter.tags = parseTags(row.tags, row.slug);

  return frontmatter;
}

function stableObject(value) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(value).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    ),
  );
}

function parseMarkdown(source, filePath) {
  const match = source.match(frontmatterPattern);
  if (!match) {
    throw new Error(`기존 Markdown frontmatter를 파싱할 수 없습니다: ${filePath}`);
  }

  let frontmatter;
  try {
    frontmatter = parseYaml(match[1]);
  } catch (error) {
    throw new Error(`기존 Markdown YAML을 파싱할 수 없습니다: ${filePath}`, {
      cause: error,
    });
  }

  if (!frontmatter || typeof frontmatter !== "object") {
    throw new Error(`기존 Markdown frontmatter가 객체가 아닙니다: ${filePath}`);
  }

  return {
    content: source.slice(match[0].length),
    frontmatter,
  };
}

function renderMarkdown(frontmatter, content) {
  const yaml = stringifyYaml(frontmatter, {
    defaultKeyType: "PLAIN",
    defaultStringType: "QUOTE_DOUBLE",
    lineWidth: 0,
  });

  return `---\n${yaml}---\n${content}`;
}

function inspectExport(database, rows) {
  const duplicateSlugs = database
    .prepare(
      `SELECT slug, COUNT(*) AS count
       FROM posts
       GROUP BY slug
       HAVING COUNT(*) > 1`,
    )
    .all();
  if (duplicateSlugs.length > 0) {
    throw new Error(
      `posts 테이블에 중복 slug가 있습니다: ${duplicateSlugs
        .map(({ slug }) => slug)
        .join(", ")}`,
    );
  }

  const publishedSlugs = new Set(rows.map(({ slug }) => slug));
  const markdownFiles = fs.existsSync(postsDirectory)
    ? fs
        .readdirSync(postsDirectory, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
        .map((entry) => entry.name)
        .sort()
    : [];
  const operations = [];
  const report = {
    created: [],
    deletionCandidates: markdownFiles
      .map((file) => file.slice(0, -3))
      .filter((slug) => !publishedSlugs.has(slug)),
    unchanged: [],
    updated: [],
  };

  for (const row of rows) {
    const frontmatter = buildFrontmatter(row);
    const filePath = path.join(postsDirectory, `${row.slug}.md`);
    const rendered = renderMarkdown(frontmatter, row.content);
    const renderedPost = parseMarkdown(rendered, filePath);

    if (
      stableObject(renderedPost.frontmatter) !== stableObject(frontmatter) ||
      renderedPost.content !== row.content
    ) {
      throw new Error(`${row.slug}의 Markdown 직렬화 검증에 실패했습니다.`);
    }

    if (!fs.existsSync(filePath)) {
      report.created.push(row.slug);
      operations.push({ filePath, rendered });
      continue;
    }

    const existing = parseMarkdown(fs.readFileSync(filePath, "utf8"), filePath);
    const metadataChanged =
      stableObject(existing.frontmatter) !== stableObject(frontmatter);
    const contentChanged = existing.content !== row.content;

    if (!metadataChanged && !contentChanged) {
      report.unchanged.push(row.slug);
      continue;
    }

    report.updated.push(row.slug);
    operations.push({ filePath, rendered });
  }

  return { operations, report };
}

function printList(label, values) {
  console.log(`${label}: ${values.length}개`);
  for (const value of values) {
    console.log(`  - ${value}`);
  }
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  const connection = readD1Connection();
  const databasePath = findDatabase(options.database);
  const database = new DatabaseSync(databasePath, { readOnly: true });

  try {
    const totalCount = database
      .prepare("SELECT COUNT(*) AS count FROM posts")
      .get().count;
    if (totalCount === 0) {
      throw new Error(
        `posts 테이블이 비어 있어 내보내기를 중단했습니다: ${databasePath}`,
      );
    }

    const rows = database
      .prepare(
        `SELECT slug, title, description, content, category, tags, series,
                series_order, published_at
         FROM posts
         WHERE status = 'published'
         ORDER BY slug`,
      )
      .all();
    if (rows.length === 0) {
      throw new Error(
        `published 상태의 게시글이 없어 내보내기를 중단했습니다: ${databasePath}`,
      );
    }

    const { operations, report } = inspectExport(database, rows);

    if (!options.dryRun) {
      fs.mkdirSync(postsDirectory, { recursive: true });
      for (const { filePath, rendered } of operations) {
        fs.writeFileSync(filePath, rendered, "utf8");
      }
    }

    console.log(`D1 설정: ${path.relative(repositoryRoot, connection.configPath)}`);
    console.log(`D1 연결: ${connection.binding} -> ${connection.databaseName}`);
    console.log(`D1 파일: ${databasePath}`);
    console.log(`posts 전체: ${totalCount}개`);
    console.log(`published 내보내기 대상: ${rows.length}개`);
    console.log(`slug 중복: 0개`);
    printList("생성", report.created);
    printList("수정", report.updated);
    printList("변경 없음", report.unchanged);
    printList("삭제하지 않고 남겨둔 파일", report.deletionCandidates);
    console.log(options.dryRun ? "Dry run 완료" : "Markdown 내보내기 완료");
  } finally {
    database.close();
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  if (error instanceof Error && error.cause) {
    console.error(error.cause);
  }
  process.exitCode = 1;
}
