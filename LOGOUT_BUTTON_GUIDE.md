# 🔐 Monitor Logout Button - Prop-Based Implementation

## Overview

This document explains the clean prop-based architecture for hiding the Logout button when the Monitor dashboard is accessed from the Services section.

---

## Architecture Flow

```
User navigates from Services
    ↓
router.push("/monitor/plants?fromService=true")
    ↓
monitor/layout.tsx detects query param
    ↓
layout reads: useSearchParams().get("fromService") === "true"
    ↓
layout passes: hideLogout={true} prop to Header
    ↓
Header receives prop and passes to UserDropdown
    ↓
UserDropdown receives prop and conditionally hides Logout button
```

---

## File Structure & Changes

### 1. **Monitor Layout** - `src/app/monitor/layout.tsx`
**Responsibility:** Detect query parameter and pass prop down

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import Header from "@/components/monitors/monitorsLayout/header";

export default function MonitorsLayout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const hideLogout = searchParams.get("fromService") === "true";

  return (
    <div className="h-screen text-white overflow-hidden">
      <Header hideLogout={hideLogout} />
      {/* ... rest of layout ... */}
    </div>
  );
}
```

### 2. **Header Component** - `src/components/monitors/monitorsLayout/header.tsx`
**Responsibility:** Accept hideLogout prop and pass to UserDropdown

```tsx
interface HeaderProps {
  hideLogout?: boolean;
}

export default function Header({ hideLogout = false }: HeaderProps) {
  // ... component code ...
  
  return (
    <header className="...">
      {/* ... left side content ... */}
      <div className="flex items-center justify-between gap-6">
        <LanguageDropdown />
        <UserDropdown hideLogout={hideLogout} />
      </div>
    </header>
  );
}
```

### 3. **UserDropdown Component** - (Same file)
**Responsibility:** Conditionally render Logout button

```tsx
interface UserDropdownProps {
  hideLogout?: boolean;
}

const UserDropdown = ({ hideLogout = false }: UserDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const router = useRouter();

  // ... implementation ...

  return (
    <div className="relative">
      {/* Dropdown trigger button */}
      <button onClick={() => setOpen(!open)} className="...">
        {/* ... user icon ... */}
      </button>

      {open && (
        <div className="absolute right-0 mt-4 w-44 bg-white border rounded-md shadow-md z-50">
          <button className="...">Settings</button>
          <button className="...">Manual</button>

          {/* ✅ Logout Button - Only render if hideLogout is false */}
          {!hideLogout && (
            <button
              onClick={() => setLogoutOpen(true)}
              className="w-full px-4 py-2 text-sm flex items-center gap-2 text-red-600 hover:bg-gray-100 cursor-pointer"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      )}

      <LogoutForm
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
};
```

---

## Usage Examples

### Option 1: Link Navigation (Easiest)
```tsx
import Link from "next/link";

<Link href="/monitor/plants?fromService=true">
  Go to Monitor
</Link>
```

### Option 2: Using Custom Hook (Recommended)
```tsx
"use client";
import { useMonitorNavigation } from "@/hooks/useMonitorNavigation";

export function MyComponent() {
  const { navigateToMonitorPlants } = useMonitorNavigation();

  return (
    <button onClick={() => navigateToMonitorPlants(true)}>
      Open Monitor (Logout Hidden)
    </button>
  );
}
```

### Option 3: Using Router
```tsx
"use client";
import { useRouter } from "next/navigation";

export function MyComponent() {
  const router = useRouter();

  return (
    <button onClick={() => router.push("/monitor/plants?fromService=true")}>
      Open Monitor
    </button>
  );
}
```

---

## TypeScript Interfaces

```tsx
// Header Props
interface HeaderProps {
  hideLogout?: boolean;
}

// UserDropdown Props
interface UserDropdownProps {
  hideLogout?: boolean;
}
```

---

## Behavior Matrix

| Scenario | URL | hideLogout | Logout Button |
|----------|-----|-----------|---------------|
| Normal Monitor Access | `/monitor/plants` | `false` | ✅ Visible |
| From Services | `/monitor/plants?fromService=true` | `true` | ❌ Hidden |
| Normal Logs | `/monitor/logs` | `false` | ✅ Visible |
| From Services (Logs) | `/monitor/logs?fromService=true` | `true` | ❌ Hidden |
| Plant Detail Normal | `/monitor/plants/plant-detail/123` | `false` | ✅ Visible |
| Plant Detail from Service | `/monitor/plants/plant-detail/123?fromService=true` | `true` | ❌ Hidden |

---

## Why This Architecture?

✅ **Clean Separation of Concerns**
- Layout handles query param detection
- Header/UserDropdown are prop-driven components
- Components are reusable and testable

✅ **Automatic for All Monitor Pages**
- Any monitor page nested under `monitor/layout.tsx` inherits the behavior
- Works for `/monitor`, `/monitor/plants`, `/monitor/logs`, etc.

✅ **Type-Safe with TypeScript**
- Props are properly typed with interfaces
- IDE autocomplete support

✅ **Easy to Extend**
- Can add more props later if needed
- Clear prop passing chain: Layout → Header → UserDropdown

✅ **Backward Compatible**
- Parameters are optional (`hideLogout?`)
- Default is `false` for normal visibility

---

## Testing Checklist

- [ ] Navigate to `/monitor/plants` → Logout button visible
- [ ] Navigate to `/monitor/plants?fromService=true` → Logout button hidden
- [ ] Navigate to `/monitor/logs` → Logout button visible
- [ ] Navigate to `/monitor/logs?fromService=true` → Logout button hidden
- [ ] Navigate to plant details → Logout button visible based on query param
- [ ] Click logout when visible → Redirects to login
- [ ] Refresh page with `?fromService=true` → Logout still hidden

---

## Related Files

- **Layout:** `src/app/monitor/layout.tsx`
- **Header:** `src/components/monitors/monitorsLayout/header.tsx`
- **Navigation Hook:** `src/hooks/useMonitorNavigation.ts`
- **Examples:** `src/components/examples/MonitorNavigationExamples.tsx`

---

## Key Points to Remember
Codex
1. **Query parameter is detected at the layout level** - Most efficient place
2. **Props flow down the component tree** - Clean and maintainable
3. **Default behavior is to show Logout** - Safe default when no query param
4. **Works automatically for all child pages** - No per-page configuration needed
5. **TypeScript ensures type safety** - Catch errors at development time
