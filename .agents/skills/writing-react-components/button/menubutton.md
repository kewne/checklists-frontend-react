# MenuButton Component Usage Guide

The `MenuButton` component renders a button that opens a dropdown menu with multiple action items. Use it when you have 2+ related actions that need to be grouped together.

## Import

```tsx
import { MenuButton, type MenuItem } from './MenuButton';
```

## Basic Usage

```tsx
<MenuButton
  items={[
    { title: 'Edit', action: () => handleEdit() },
    { title: 'Export', action: () => handleExport() },
    { title: 'Delete', action: () => handleDelete() },
  ]}
  ariaLabel="Actions"
>
  ⋮
</MenuButton>
```
