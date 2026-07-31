import assert from "node:assert/strict";
import test from "node:test";
import {
  getSeriesNavigation,
  getSeriesPosition,
  getSeriesPosts,
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
