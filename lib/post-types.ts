export const POST_CATEGORIES = [
  { value: "Frontend", label: "프론트엔드" },
  { value: "Backend", label: "백엔드" },
  { value: "Algorithm", label: "알고리즘" },
] as const;

export const POST_STATUSES = ["draft", "published"] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number]["value"];
export type PostStatus = (typeof POST_STATUSES)[number];

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  category: PostCategory;
  tags: string[];
  series?: string;
  seriesOrder?: number;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
};

export type Post = PostSummary & {
  content: string;
};

export type PostInput = {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: PostCategory;
  tags: string[];
  series?: string;
  seriesOrder?: number;
  status: PostStatus;
};

export function isPostCategory(value: unknown): value is PostCategory {
  return POST_CATEGORIES.some((category) => category.value === value);
}

export function isPostStatus(value: unknown): value is PostStatus {
  return POST_STATUSES.some((status) => status === value);
}

export function formatPostDate(date: string) {
  const [year, month, day] = date.slice(0, 10).split("-");
  return day ? `${year}.${month}.${day}` : date;
}

export function formatAdminDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
}
