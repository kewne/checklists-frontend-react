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

## Buttons

All interactive buttons must use the `Button` component from `app/components/Button.tsx`. Never use native `<button>` elements with custom styling.

### Usage Examples

```tsx
import { Button } from './Button';

// Simple primary button
<Button action={() => handleSave()}>Save</Button>

// Secondary outline button for secondary actions
<Button type="secondary" variant="outline" action={() => handleEdit()}>
  Edit
</Button>

// Danger button for destructive actions
<Button type="danger" variant="normal" action={() => handleDelete()}>
  Delete
</Button>

// Text-only button (typically for cancel/dismiss actions)
<Button type="secondary" variant="text" action={() => handleCancel()}>
  Cancel
</Button>

// Split button with additional actions
<Button
  type="secondary"
  variant="outline"
  action={() => handleEdit()}
  additionalActions={[
    { title: 'Export', action: () => handleExport() },
    { title: 'Duplicate', action: () => handleDuplicate() },
    { title: 'Delete', action: () => handleDelete() },
  ]}
>
  Edit
</Button>
```

### When to Use Each Type

- **`primary`** — Use for the main call-to-action or primary confirmation (Create, Save, Submit, etc.)
- **`secondary`** — Use for supporting actions (Edit, Cancel, auxiliary controls)
- **`success`** — Use for actions that represent a positive outcome or approval
- **`danger`** — Use for destructive actions that cannot be undone (Delete, Remove, etc.)

### When to Use Each Variant

- **`normal`** — Default for primary actions; use when the button is the main call-to-action
- **`outline`** — Use for secondary or supporting actions that need visual hierarchy
- **`text`** — Use for dismissal or low-priority actions (Cancel, Close) in dialogs and modals
