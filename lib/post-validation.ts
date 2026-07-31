import {
  isPostCategory,
  isPostStatus,
  type PostInput,
} from "./post-types";

type ValidationResult =
  | { data: PostInput; error: null }
  | { data: null; error: string };

export function validatePostInput(value: unknown): ValidationResult {
  if (!value || typeof value !== "object") {
    return { data: null, error: "입력한 글 정보를 확인해 주세요." };
  }

  const body = value as Record<string, unknown>;
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  const category = body.category;
  const status = body.status;
  const series =
    typeof body.series === "string" && body.series.trim()
      ? body.series.trim()
      : undefined;
  const seriesOrder =
    typeof body.seriesOrder === "number" ? body.seriesOrder : undefined;
  const tags = Array.isArray(body.tags)
    ? body.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim().replace(/^#/, ""))
        .filter(Boolean)
        .slice(0, 10)
    : [];

  if (!title || title.length > 120) {
    return { data: null, error: "제목은 1자 이상 120자 이하로 입력해 주세요." };
  }
  if (!description || description.length > 300) {
    return {
      data: null,
      error: "요약은 1자 이상 300자 이하로 입력해 주세요.",
    };
  }
  if (
    !slug ||
    slug.length > 100 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  ) {
    return {
      data: null,
      error: "주소는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.",
    };
  }
  if (!isPostCategory(category)) {
    return { data: null, error: "카테고리를 선택해 주세요." };
  }
  if (!isPostStatus(status)) {
    return { data: null, error: "저장 상태를 확인해 주세요." };
  }
  if (series && series.length > 80) {
    return { data: null, error: "시리즈명은 80자 이하로 입력해 주세요." };
  }
  if (Boolean(series) !== (seriesOrder !== undefined)) {
    return {
      data: null,
      error: "시리즈명과 시리즈 순서를 함께 입력해 주세요.",
    };
  }
  if (
    seriesOrder !== undefined &&
    (!Number.isInteger(seriesOrder) || seriesOrder < 1)
  ) {
    return {
      data: null,
      error: "시리즈 순서는 1 이상의 정수로 입력해 주세요.",
    };
  }
  if (content.length > 150_000) {
    return { data: null, error: "본문은 15만 자 이하로 입력해 주세요." };
  }
  if (status === "published" && !content.trim()) {
    return { data: null, error: "발행할 글의 본문을 입력해 주세요." };
  }

  return {
    data: {
      slug,
      title,
      description,
      content,
      category,
      tags: [...new Set(tags)],
      series,
      seriesOrder,
      status,
    },
    error: null,
  };
}
