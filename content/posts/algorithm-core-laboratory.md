---
title: "여러 유형을 한 문제에 연결하기: 백준 14502 연구소"
description: "강의의 알고리즘 핵심문제 파트에서 완전탐색과 BFS를 함께 사용해 연구소의 최대 안전 영역을 구했습니다."
date: "2026-07-29"
category: "Algorithm"
tags:
  - Brute Force
  - BFS
  - Simulation
  - BOJ
---

자료구조부터 DP까지 유형별로 공부한 뒤에는 한 문제에 어떤 알고리즘을 적용해야 하는지 판단하는 연습을 했다. 실제 문제는 제목에 유형이 적혀 있지 않고, 두 가지 이상의 풀이가 결합되는 경우도 많았다.

강의의 핵심문제 파트에서 정리한 순서는 다음과 같다.

1. 문제에서 직접 바꿀 수 있는 선택을 찾는다.
2. 그 선택의 경우의 수가 충분히 작은지 계산한다.
3. 한 선택의 결과를 어떻게 확인할지 정한다.
4. 전체 시간복잡도가 입력 범위 안에 들어오는지 검산한다.

## 문제: 백준 14502 연구소

[백준 14502번 연구소](https://www.acmicpc.net/problem/14502)는 빈칸에 벽 세 개를 세운 뒤 바이러스가 퍼지고, 남는 안전 영역의 최댓값을 구하는 문제다.

이 문제에는 두 단계가 있다.

- 벽을 세울 세 칸 선택: 완전탐색
- 선택한 뒤 바이러스 확산: BFS

벽을 어디에 세워야 하는지 바로 결정할 수 있는 그리디 기준은 보이지 않는다. 대신 연구소의 크기가 작기 때문에 빈칸 중 세 곳을 모두 선택해 볼 수 있다.

## 경우의 수 계산

빈칸 수를 E라고 하면 벽 세 개를 고르는 경우는 `EC3`이다. 연구소 전체 칸이 최대 64개이므로 가장 크게 잡아도 `64C3` 정도다.

각 경우마다 최대 64칸을 BFS로 확인한다.

```text
O(EC3 × N × M)
```

최대 입력에서도 충분히 계산 가능한 범위다. 이 검산을 통해 벽 조합을 완전탐색해도 된다고 판단했다.

## 최종 코드

```python
from collections import deque
from itertools import combinations
import sys

input = sys.stdin.readline

n, m = map(int, input().split())
laboratory = [list(map(int, input().split())) for _ in range(n)]

empty_spaces = []
viruses = []

for row in range(n):
    for col in range(m):
        if laboratory[row][col] == 0:
            empty_spaces.append((row, col))
        elif laboratory[row][col] == 2:
            viruses.append((row, col))

directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
max_safe_area = 0


def count_safe_area(walls):
    board = [row[:] for row in laboratory]

    for row, col in walls:
        board[row][col] = 1

    queue = deque(viruses)

    while queue:
        row, col = queue.popleft()

        for dr, dc in directions:
            next_row = row + dr
            next_col = col + dc

            if not (0 <= next_row < n and 0 <= next_col < m):
                continue

            if board[next_row][next_col] != 0:
                continue

            board[next_row][next_col] = 2
            queue.append((next_row, next_col))

    return sum(row.count(0) for row in board)


for walls in combinations(empty_spaces, 3):
    max_safe_area = max(max_safe_area, count_safe_area(walls))

print(max_safe_area)
```

## 코드 리뷰

```python
empty_spaces = []
viruses = []
```

매 조합마다 연구소 전체를 다시 순회해 빈칸과 바이러스 위치를 찾지 않도록 처음에 한 번 분리해 둔다.

```python
for walls in combinations(empty_spaces, 3):
```

벽의 순서는 결과에 영향을 주지 않는다. 순열이 아니라 조합을 사용해 같은 세 칸을 순서만 바꿔 중복 검사하지 않는다.

```python
board = [row[:] for row in laboratory]
```

각 벽 조합은 서로 독립적으로 실험해야 한다. 원본을 바꾸지 않도록 행마다 복사한 새 보드를 만든다.

```python
queue = deque(viruses)
```

처음부터 존재하는 모든 바이러스를 큐에 넣는다. 여러 시작점에서 동시에 퍼지는 과정도 BFS 한 번으로 처리할 수 있다.

```python
board[next_row][next_col] = 2
queue.append((next_row, next_col))
```

바이러스를 큐에 넣는 순간 해당 칸을 2로 변경한다. 나중에 꺼낼 때 변경하면 다른 바이러스가 같은 칸을 중복으로 큐에 넣을 수 있다.

## 트러블슈팅

### 벽을 세운 원본 배열이 다음 조합에도 남았다

처음에는 원본에 벽을 세우고 BFS를 실행한 뒤 벽만 다시 0으로 바꿨다. 하지만 BFS가 바꾼 바이러스 위치까지 모두 복원해야 해서 누락이 생겼다. 입력 크기가 작으므로 조합마다 보드 전체를 복사하는 방식으로 단순화했다.

### 바이러스 하나만 시작점으로 넣었다

연구소에는 바이러스가 여러 개 있을 수 있다. 각 바이러스마다 BFS를 따로 실행할 필요는 없지만, 초기 큐에는 모든 바이러스 위치가 들어가야 한다.

### 벽의 위치를 세 중첩 반복문으로 골랐다

직접 반복문을 작성하면 인덱스 범위와 중복 선택을 계속 신경 써야 했다. `combinations(empty_spaces, 3)`을 사용하니 '빈칸 중 서로 다른 세 곳'이라는 조건이 코드에 그대로 드러났다.

### 안전 영역을 벽을 세우기 전에 계산했다

안전 영역은 바이러스 확산이 모두 끝난 뒤 값이 0인 칸만 세어야 한다. 새로 세운 벽은 1이고 감염된 칸은 2이므로 `row.count(0)`을 합하면 안전 영역만 남는다.

## 풀이를 고른 기준

이 문제를 BFS 문제 하나로만 보면 벽의 위치를 정하기 어렵고, 완전탐색 문제 하나로만 보면 각 선택의 결과를 계산하기 어렵다.

```text
선택 가능한 벽 조합을 모두 만든다.
→ 각 조합에서 BFS로 바이러스를 퍼뜨린다.
→ 남은 안전 영역의 최댓값을 갱신한다.
```

문장을 세 단계로 나누니 각 단계에 맞는 알고리즘이 보였다.

## 정리

유형별 학습의 목적은 문제를 한 단어로 분류하는 것이 아니었다. 연구소 문제처럼 **선택은 완전탐색으로, 선택의 결과는 BFS로** 계산할 수 있다. 이후 핵심문제를 풀 때는 한 번에 알고리즘 이름을 맞히려 하지 않고, 문제의 동작을 작은 단계로 나눈 뒤 각 단계에 필요한 도구를 고르고 있다.
