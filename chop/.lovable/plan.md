## Changes

### 1. Split mode chips (`src/components/BillItemsManager.tsx`)

Replace the current `ToggleGroup` (plain text when unselected, hard to tell which is active) with clearly-styled chips:

- **Unselected**: white background, visible border (`border-input`), muted text
- **Selected**: primary background, white text, subtle shadow — clearly stands out
- Rounded-full pill shape, comfortable padding

Update copy:
- "Split Equally" → **Equally**
- "By Amount" → **Amount**
- "By Percentage" → **Percentage**

Implementation: keep `ToggleGroup`/`ToggleGroupItem` but pass explicit className overrides for selected/unselected states, e.g.:

```tsx
<ToggleGroupItem
  value="equal"
  className="rounded-full border border-input bg-white text-muted-foreground px-4 py-1.5
             data-[state=on]:bg-primary data-[state=on]:text-primary-foreground
             data-[state=on]:border-primary data-[state=on]:shadow-sm"
>
  Equally
</ToggleGroupItem>
```
(same pattern for Amount and Percentage)

### 2. Consistent white background across pages

Replace non-white page backgrounds with plain white (`bg-white`):

- `src/pages/Landing.tsx` (line 61): remove `bg-gradient-to-br from-blue-50 to-indigo-100` and `bg-zinc-50` → `bg-white`
- `src/pages/Index.tsx` (lines 181, 191): `bg-gray-50` → `bg-white`
- `src/pages/NotFound.tsx` (line 15): `bg-gray-100` → `bg-white`

No other layout changes.
