
## 2024-05-24 - [Date sorting performance in Array.sort]
**Learning:** Using `new Date(string).getTime()` directly inside array `.sort()` comparators introduces significant overhead due to object instantiation on every comparison step. For 'YYYY-MM-DD' formatted date strings, direct string comparison (e.g. `a < b ? 1 : a > b ? -1 : 0`) is lexicographically correct and about ~8x faster.
**Action:** When sorting YYYY-MM-DD formatted strings, use direct string comparison rather than converting to `Date` objects inside the sorting loop.
