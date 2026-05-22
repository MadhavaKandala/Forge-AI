## 2024-05-22 - Fast Date Sorting Optimization
**Learning:** Instantiating `new Date(string)` inside an array `.sort()` comparator function is a massive performance bottleneck because the `sort()` callback is executed O(N log N) times.
**Action:** Always prefer direct string comparison (`a < b ? -1 : 1` or `localeCompare`) over `new Date()` when sorting properly formatted ISO date strings (`YYYY-MM-DD`). The lexicographical order perfectly matches chronological order and operates significantly faster.
