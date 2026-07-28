---
title: "방문 상태를 구분하며 익힌 DFS·BFS·백트래킹"
description: "백준 1260과 15649를 풀며 그래프 탐색의 방문 처리와 백트래킹의 상태 복원을 비교했습니다."
date: "2026-07-29"
category: "Algorithm"
tags:
  - DFS
  - BFS
  - Backtracking
  - BOJ
---

DFS, BFS, 백트래킹은 모두 다음 상태로 이동하며 탐색한다는 점이 비슷했다. 처음에는 재귀를 쓰면 DFS, 큐를 쓰면 BFS 정도로 구분했지만, 강의와 스터디 문제를 풀면서 더 중요한 차이는 **방문 상태를 언제 기록하고 언제 되돌리는지**라는 것을 알게 됐다.

## DFS와 BFS의 차이

| 구분 | DFS | BFS |
| --- | --- | --- |
| 진행 방식 | 한 경로를 끝까지 탐색 | 시작점과 가까운 순서로 탐색 |
| 주로 사용하는 구조 | 재귀 또는 스택 | 큐 |
| 잘 맞는 문제 | 경로 존재, 연결 요소, 모든 경우 탐색 | 간선 비용이 같은 그래프의 최단 거리 |

두 방식 모두 이미 방문한 정점을 다시 탐색하지 않도록 `visited`가 필요하다.

## 문제 1: 백준 1260 DFS와 BFS

[백준 1260번 DFS와 BFS](https://www.acmicpc.net/problem/1260)는 같은 그래프를 DFS와 BFS로 각각 탐색한 순서를 출력하는 문제다. 방문할 수 있는 정점이 여러 개라면 번호가 작은 정점부터 방문해야 하므로 인접 리스트 정렬이 필요하다.

```python
from collections import deque
import sys

input = sys.stdin.readline

n, m, start = map(int, input().split())
graph = [[] for _ in range(n + 1)]

for _ in range(m):
    a, b = map(int, input().split())
    graph[a].append(b)
    graph[b].append(a)

for nodes in graph:
    nodes.sort()

dfs_order = []
dfs_visited = [False] * (n + 1)


def dfs(node):
    dfs_visited[node] = True
    dfs_order.append(node)

    for next_node in graph[node]:
        if not dfs_visited[next_node]:
            dfs(next_node)


def bfs(start_node):
    order = []
    visited = [False] * (n + 1)
    queue = deque([start_node])
    visited[start_node] = True

    while queue:
        node = queue.popleft()
        order.append(node)

        for next_node in graph[node]:
            if not visited[next_node]:
                visited[next_node] = True
                queue.append(next_node)

    return order


dfs(start)
print(*dfs_order)
print(*bfs(start))
```

### 코드 리뷰

```python
graph[a].append(b)
graph[b].append(a)
```

간선이 양방향이므로 두 정점의 인접 리스트에 모두 추가한다.

```python
for nodes in graph:
    nodes.sort()
```

정점 번호가 작은 순서로 방문하라는 조건을 반영한다. 탐색 로직이 맞더라도 이 정렬을 빠뜨리면 출력 순서가 달라질 수 있다.

```python
visited[start_node] = True
```

BFS에서는 큐에 넣는 순간 방문 처리한다. 큐에서 꺼낼 때 처리하면 여러 정점이 같은 정점을 중복으로 큐에 넣을 수 있다.

인접 리스트를 정렬하는 비용을 제외하면 DFS와 BFS 탐색은 각각 `O(N + M)`이다.

## 문제 2: 백준 15649 N과 M (1)

[백준 15649번 N과 M (1)](https://www.acmicpc.net/problem/15649)은 1부터 N까지의 수 중 중복 없이 M개를 고른 모든 순열을 출력하는 문제다.

그래프 탐색에서는 한 번 방문한 정점을 다시 볼 필요가 없지만, 백트래킹에서는 현재 경로의 탐색이 끝나면 선택을 되돌려 다른 경우에서 다시 사용할 수 있어야 한다.

```python
n, m = map(int, input().split())

sequence = []
used = [False] * (n + 1)


def backtrack():
    if len(sequence) == m:
        print(*sequence)
        return

    for number in range(1, n + 1):
        if used[number]:
            continue

        used[number] = True
        sequence.append(number)

        backtrack()

        sequence.pop()
        used[number] = False


backtrack()
```

### 코드 리뷰

```python
if len(sequence) == m:
    print(*sequence)
    return
```

선택한 숫자가 M개가 되면 하나의 경우가 완성된다. 출력한 뒤 더 깊이 탐색하지 않고 현재 호출을 끝낸다.

```python
used[number] = True
sequence.append(number)
```

현재 경로에서 숫자를 선택하고 다음 깊이로 이동한다.

```python
sequence.pop()
used[number] = False
```

재귀 호출이 끝나면 선택 이전 상태로 복원한다. 이 두 줄이 있어야 다음 숫자를 선택하는 새로운 경로를 탐색할 수 있다.

## 트러블슈팅

### DFS 결과를 BFS에서도 그대로 사용했다

DFS가 끝난 뒤 같은 `visited` 배열로 BFS를 시작하면 모든 정점이 이미 방문된 상태다. 두 탐색의 목적이 다르므로 방문 배열도 각각 만들어야 했다.

### BFS에서 같은 정점이 큐에 여러 번 들어갔다

처음에는 큐에서 꺼낼 때 방문 처리했다. 한 정점이 큐에서 나오기 전에 여러 인접 정점이 그 정점을 발견하면 중복 삽입된다. **큐에 추가하는 순간** 방문 처리하도록 바꿨다.

### 백트래킹 결과가 첫 경로만 나오거나 중복됐다

`used[number] = False`를 빠뜨리면 첫 경로에서 사용한 숫자를 다음 경로에서 쓸 수 없다. 반대로 현재 경로에 들어가기 전에 방문 처리하지 않으면 같은 숫자가 한 수열에 중복된다. 선택과 복원을 한 쌍으로 두고 순서를 확인했다.

### 재귀가 항상 백트래킹은 아니었다

DFS도 재귀로 구현할 수 있지만 모든 DFS가 상태를 복원하는 것은 아니다. 그래프 DFS의 `visited`는 전체 탐색 동안 유지되고, 순열 백트래킹의 `used`는 현재 경로가 끝나면 되돌린다. 이 차이를 기준으로 두 방식을 구분하니 코드가 더 잘 이해됐다.

## 정리

DFS와 BFS에서는 중복 방문을 막기 위해 상태를 유지한다. 백트래킹에서는 한 경로의 선택을 기록하되, 그 경로를 빠져나올 때 상태를 복원한다. 세 알고리즘을 문법으로 외우기보다 **방문 정보가 전체 탐색에 속하는지, 현재 경로에만 속하는지**를 먼저 판단하는 것이 중요했다.
