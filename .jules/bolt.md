## 2024-05-24 - [Avoid Date Parsing in Sort Loops]
**Learning:** Instantiating `new Date()` within array `.sort()` methods creates severe performance bottlenecks due to excessive object allocation and garbage collection, particularly during high-frequency renders or with large arrays.
**Action:** When sorting string dates formatted as YYYY-MM-DD (ISO 8601), always use string comparison like `localeCompare` instead of parsing them as dates.
