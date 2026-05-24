## 2024-05-24 - Add ARIA Labels to Dynamic Icon Buttons
**Learning:** Icon-only buttons with dynamic states (e.g., Play/Pause) require dynamic `aria-label`s to be accessible to screen readers, ensuring users understand the current action available.
**Action:** Always verify icon-only buttons include an `aria-label`, and update the label dynamically if the button's action changes based on state.

## 2024-05-23 - Focus states and interactive elements
**Learning:** Adding `focus-visible` utilities alongside `group-hover` ensures that UI elements that only appear on hover (like inline delete buttons) are also accessible and visible via keyboard navigation.
**Action:** Next time, always pair `opacity-0 group-hover:opacity-100` with `focus-visible:opacity-100 group-focus-within:opacity-100` for accessibility parity.
