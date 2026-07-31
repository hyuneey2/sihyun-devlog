import assert from "node:assert/strict";
import test from "node:test";
import {
  getSeriesLatestDate,
  getSeriesNavigation,
  getSeriesPosition,
  getSeriesPosts,
  getSortedSeriesPosts,
  groupPostsForPublicList,
} from "../lib/post-series.ts";

const posts = [
  {
    id: "node-3",
    slug: "node-3",
    series: "Node.js 스터디",
    seriesOrder: 3,
  },
  {
    id: "react-1",
    slug: "react-1",
    series: "React 스터디",
    seriesOrder: 1,
  },
  {
    id: "node-1",
    slug: "node-1",
    series: "Node.js 스터디",
    seriesOrder: 1,
  },
  {
    id: "plain",
    slug: "plain",
  },
  {
    id: "node-2",
    slug: "node-2",
    series: "Node.js 스터디",
    seriesOrder: 2,
  },
];

test("같은 시리즈 글만 순서대로 정렬한다", () => {
  assert.deepEqual(
    getSeriesPosts(posts, "Node.js 스터디").map((post) => post.id),
    ["node-1", "node-2", "node-3"],
  );
});

test("현재 글의 이전 글과 다음 글을 같은 시리즈에서 찾는다", () => {
  const navigation = getSeriesNavigation(posts, posts[4]);

  assert.equal(navigation.previous?.id, "node-1");
  assert.equal(navigation.next?.id, "node-3");
});

test("첫 글과 마지막 글에서는 없는 방향을 반환하지 않는다", () => {
  const firstNavigation = getSeriesNavigation(posts, posts[2]);
  const lastNavigation = getSeriesNavigation(posts, posts[0]);

  assert.equal(firstNavigation.previous, undefined);
  assert.equal(firstNavigation.next?.id, "node-2");
  assert.equal(lastNavigation.previous?.id, "node-2");
  assert.equal(lastNavigation.next, undefined);
});

test("시리즈 순서와 전체 글 수를 계산한다", () => {
  assert.deepEqual(getSeriesPosition(posts, posts[4]), {
    current: 2,
    total: 3,
  });
  assert.equal(getSeriesPosition(posts, posts[3]), undefined);
});

const publicPosts = [
  {
    id: "regular-latest",
    slug: "regular-latest",
    title: "일반 최신 글",
    description: "일반 글",
    date: "2026-07-19T00:00:00.000Z",
    createdAt: "2026-07-19T00:00:00.000Z",
    updatedAt: "2026-07-19T00:00:00.000Z",
    category: "Backend",
    tags: [],
    status: "published",
  },
  {
    id: "node-3",
    slug: "node-3",
    title: "Node 03",
    description: "세 번째 글",
    date: "2026-07-20T00:00:00.000Z",
    createdAt: "2026-07-20T00:00:00.000Z",
    updatedAt: "2026-07-20T00:00:00.000Z",
    category: "Backend",
    tags: [],
    series: "Node.js 스터디",
    seriesOrder: 3,
    status: "published",
  },
  {
    id: "node-1",
    slug: "node-1",
    title: "Node 01",
    description: "첫 번째 글",
    date: "2026-06-01T00:00:00.000Z",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    category: "Backend",
    tags: [],
    series: "Node.js 스터디",
    seriesOrder: 1,
    status: "published",
  },
  {
    id: "node-2",
    slug: "node-2",
    title: "Node 02",
    description: "두 번째 글",
    date: "2026-07-10T00:00:00.000Z",
    createdAt: "2026-07-10T00:00:00.000Z",
    updatedAt: "2026-07-10T00:00:00.000Z",
    category: "Backend",
    tags: [],
    series: "Node.js 스터디",
    seriesOrder: 2,
    status: "published",
  },
  {
    id: "frontend-node-1",
    slug: "frontend-node-1",
    title: "다른 카테고리의 동명 시리즈",
    description: "다른 카테고리 글",
    date: "2026-07-18T00:00:00.000Z",
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-18T00:00:00.000Z",
    category: "Frontend",
    tags: [],
    series: "Node.js 스터디",
    seriesOrder: 1,
    status: "published",
  },
];

test("공개 목록에서는 같은 카테고리의 동명 시리즈만 하나로 묶는다", () => {
  const items = groupPostsForPublicList(publicPosts);
  const seriesItems = items.filter((item) => item.type === "series");

  assert.equal(items.length, 3);
  assert.equal(seriesItems.length, 2);
  assert.equal(seriesItems[0].posts.length, 3);
  assert.equal(seriesItems[1].posts.length, 1);
});

test("대표 글은 가장 작은 순서, 목록 정렬 날짜는 가장 최근 글을 사용한다", () => {
  const originalOrder = publicPosts.map((post) => post.id);
  const items = groupPostsForPublicList(publicPosts);
  const nodeSeries = items.find(
    (item) =>
      item.type === "series" &&
      item.representativePost.category === "Backend",
  );

  assert.equal(items[0], nodeSeries);
  assert.equal(nodeSeries?.representativePost.id, "node-1");
  assert.equal(nodeSeries?.latestDate, "2026-07-20T00:00:00.000Z");
  assert.deepEqual(
    nodeSeries?.posts.map((post) => post.id),
    ["node-1", "node-2", "node-3"],
  );
  assert.deepEqual(
    publicPosts.map((post) => post.id),
    originalOrder,
  );
});

test("중복되거나 누락된 시리즈 순서도 안정적으로 정렬한다", () => {
  const irregularPosts = [
    { ...publicPosts[1], id: "duplicate-b", slug: "duplicate-b", seriesOrder: 2 },
    { ...publicPosts[2], id: "missing", slug: "missing", seriesOrder: undefined },
    { ...publicPosts[3], id: "duplicate-a", slug: "duplicate-a", seriesOrder: 2 },
  ];

  assert.deepEqual(
    getSortedSeriesPosts(irregularPosts).map((post) => post.id),
    ["duplicate-a", "duplicate-b", "missing"],
  );
  assert.equal(
    getSeriesLatestDate(irregularPosts),
    "2026-07-20T00:00:00.000Z",
  );
});
