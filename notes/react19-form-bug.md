# React 19 Form Action Bug with Controlled Inputs

## Problem
When using `useActionState` with controlled inputs (`checked` or `value` props), React 19's form action handling "restores" DOM states after action completion, overwriting React's controlled values. The CSS `:checked` pseudo-class desyncs from React state.

## Symptoms
- After failed form submission, controlled checkboxes appear unchecked visually
- React state is correct (e.g., "Tags 3/3" shows correctly)
- Clicking any checkbox suddenly "fixes" all of them

## Solution
Increment a key when action state changes to force remount:

```tsx
const [formKey, setFormKey] = useState(0);
useEffect(() => {
    if (state !== null) setFormKey(k => k + 1);
}, [state]);

// Apply to controlled elements:
<FormField key={formKey}>
    <input checked={isSelected} ... />
</FormField>
```

## Affected Components
- `ReviewForm.tsx` - tag checkboxes

## Note for Form Persistence
If implementing form persistence (login, register, etc.) with controlled inputs + `useActionState`, apply this same pattern.

