import assert from "node:assert/strict";
import test from "node:test";
import { getProjectPosts } from "../lib/project-posts.ts";

function createPost(id, date, tags) {
  return {
    id,
    slug: id,
    title: id,
    description: id,
    date,
    category: "Frontend",
    tags,
    status: "published",
    createdAt: date,
    updatedAt: date,
  };
}

test("프로젝트 태그가 일치하는 공개 글을 빠짐없이 반환한다", () => {
  const posts = [
    createPost("old", "2026-07-01T00:00:00.000Z", ["withchurch"]),
    createPost("new", "2026-07-04T00:00:00.000Z", ["WITHCHURCH"]),
    createPost("other", "2026-07-05T00:00:00.000Z", ["Dailog"]),
    createPost("middle", "2026-07-03T00:00:00.000Z", [" withChurch "]),
    createPost("third", "2026-07-02T00:00:00.000Z", ["withchurch"]),
  ];

  assert.deepEqual(
    getProjectPosts(posts, "withchurch").map((post) => post.id),
    ["new", "middle", "third", "old"],
  );
});

test("같은 날 발행한 시리즈는 읽는 순서로 정렬하며 초안은 제외한다", () => {
  const posts = [3, 1, 2].map((order) => ({
    ...createPost(`part-${order}`, "2026-11-10", ["Unstiff"]),
    series: "Unstiff 개발기",
    seriesOrder: order,
  }));
  posts.push({ ...posts[0], slug: "draft", id: "draft", status: "draft" });
  assert.deepEqual(
    getProjectPosts(posts, "Unstiff").map((p) => p.id),
    ["part-1", "part-2", "part-3"],
  );
  assert.deepEqual(getProjectPosts(posts, "LocalLens"), []);
});

test("원본 배열을 변경하지 않고 빈 태그와 0개 제한을 처리한다", () => {
  const posts = [
    createPost("old", "2026-07-01T00:00:00.000Z", ["Dailog"]),
    createPost("new", "2026-07-02T00:00:00.000Z", ["dailog"]),
  ];
  const originalOrder = posts.map((post) => post.id);

  assert.deepEqual(
    getProjectPosts(posts, "Dailog", 1).map(({ id }) => id),
    ["new"],
  );
  assert.deepEqual(getProjectPosts(posts, "", 3), []);
  assert.deepEqual(getProjectPosts(posts, "Dailog", 0), []);
  assert.deepEqual(
    posts.map((post) => post.id),
    originalOrder,
  );
});
