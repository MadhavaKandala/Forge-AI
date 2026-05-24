## 2024-05-23 - Focus states and interactive elements
**Learning:** Adding `focus-visible` utilities alongside `group-hover` ensures that UI elements that only appear on hover (like inline delete buttons) are also accessible and visible via keyboard navigation.
**Action:** Next time, always pair `opacity-0 group-hover:opacity-100` with `focus-visible:opacity-100 group-focus-within:opacity-100` for accessibility parity.
