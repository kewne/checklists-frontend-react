---
name: writing-react-components
description: Guidelines for writing React components in this codebase
---

## Navigation

- For static navigation (e.g. links in JSX), use `Link` or `NavLink` from `react-router`.
- For dynamic navigation in component event handlers (e.g. after an async operation), use `useNavigate` from `react-router`.
- The `redirect` function from `react-router` is only for use in loaders and actions, not component event handlers.

```tsx
// Static: use NavLink or Link
<NavLink to="/some/path">Go</NavLink>

// Dynamic: use useNavigate in event handlers
const navigate = useNavigate();
const handleClick = async () => {
  await doSomething();
  navigate('/some/path');
};
```
