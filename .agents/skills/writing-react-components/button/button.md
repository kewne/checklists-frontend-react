# Button Component

The `Button` component is for simple, single-action buttons. Use it for primary calls-to-action, secondary operations, and destructive actions.

## Import

```tsx
import { Button } from './Button';
```
## Type & Variant Combinations

### Primary Action (Main Call-to-Action)

```tsx
// Normal variant (solid, most prominent)
<Button type="primary" action={handleSave}>
  Save
</Button>

// Outline variant (secondary prominence)
<Button type="primary" variant="outline" action={handleCreate}>
  Create
</Button>

// Text variant (minimal prominence)
<Button type="primary" variant="text" action={handleApply}>
  Apply
</Button>
```

### Secondary Action (Supporting Action)

```tsx
// Use for non-primary operations
<Button type="secondary" action={handleEdit}>
  Edit
</Button>

<Button type="secondary" variant="outline" action={handleCancel}>
  Cancel
</Button>
```

### Success Action (Positive Outcome)

Use the "success" button type for buttons that 

```tsx
// Use for actions that represent success/approval
<Button type="success" action={handleApprove}>
  Approve
</Button>
```

### Danger Action

Use these for actions that are destructive or could have a high negative impact.

```tsx
// Use for destructive actions (delete, remove, etc.)
<Button type="danger" action={handleDelete}>
  Delete
</Button>

// Outline variant for less prominent destructive actions
<Button type="danger" variant="outline" action={handleRemove}>
  Remove
</Button>
```


## Disabling

The button is disabled while the action is executing, so the `disabled` prop should only be used for external conditions that disable the button.
