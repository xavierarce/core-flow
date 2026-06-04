Write or update Vitest unit tests for all files modified in the current session.

## Step 1 — Discover modified files

```bash
git diff --name-only HEAD
git status --short
```

Filter for `.ts` and `.tsx` files under `client/`. Skip:
- `*.types.ts` / `types/index.ts` — no logic to test
- `app/**/page.tsx` / `app/**/layout.tsx` — Next.js routing files (integration scope)
- `prisma/` — migration/schema files

Prioritize files with real logic:
- `lib/*.utils.ts` — pure functions, highest priority
- `hooks/use*.ts` — stateful hooks
- `services/*.service.ts` — service objects
- `components/**/*.tsx` — render + interaction tests

## Step 2 — Map each source file to its test path

Tests live in `client/__tests__/` and mirror the source tree:

| Source | Test |
|--------|------|
| `client/lib/account.utils.tsx` | `client/__tests__/lib/account.utils.test.ts` |
| `client/services/accounts.service.ts` | `client/__tests__/services/accounts.service.test.ts` |
| `client/components/shared/AppButton.tsx` | `client/__tests__/components/shared/AppButton.test.tsx` |
| `client/components/features/settings/CategoryManager.tsx` | `client/__tests__/components/features/settings/CategoryManager.test.tsx` |

If the test file already exists, **update** it (add missing cases, fix stale ones). Otherwise, **create** it.

## Step 3 — Read the source file before writing any test

Understand every exported function or component. Identify:
- What it does and what it returns
- Its dependencies (what needs to be mocked)
- Edge cases: empty input, null/undefined, 0, [], boundary values, error paths

## Step 4 — Write the tests

### Conventions (CLAUDE-CODE-RULES.md applies)

- **Arrow functions** — `it("...", () => { ... })`, never `function`
- **Array syntax** — `Array<string>`, never `string[]`
- **No `any`** — use `unknown` + narrowing, or precise types
- **Import types** with `import type { ... }`

### Imports

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
```

### Utils — test every exported function

```ts
describe("formatBalance", () => {
  it("formats USD amounts with symbol", () => {
    expect(formatBalance(1000, "USD")).toBe("$1,000.00");
  });

  it("handles negative balances", () => {
    expect(formatBalance(-500, "EUR")).toBe("-€500.00");
  });
});
```

Cover: happy path, edge cases (empty, null, undefined, 0, boundary), and error behavior.

### Hooks — use `renderHook` + `act`

```ts
import { renderHook, act } from "@testing-library/react";

describe("useMyHook", () => {
  it("initialises with the provided default", () => {
    const { result } = renderHook(() => useMyHook({ defaultValue: "x" }));
    expect(result.current.value).toBe("x");
  });

  it("updates state when setValue is called", () => {
    const { result } = renderHook(() => useMyHook({}));
    act(() => { result.current.setValue("y"); });
    expect(result.current.value).toBe("y");
  });
});
```

### Components — use `render` + `screen`

```ts
import { render, screen, fireEvent } from "@testing-library/react";

describe("AppButton", () => {
  it("renders children", () => {
    render(<AppButton variantType="primary">Save</AppButton>);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<AppButton variantType="primary" onClick={onClick}>Save</AppButton>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

### Services — mock fetch

```ts
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("AccountsService.getAll", () => {
  it("returns accounts on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: "1", name: "Checking" }],
    });
    const result = await AccountsService.getAll("mock-token");
    expect(result).toHaveLength(1);
  });

  it("returns empty array on error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    const result = await AccountsService.getAll("mock-token");
    expect(result).toEqual([]);
  });
});
```

### Standard mocks

```ts
// next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Clerk auth (client)
vi.mock("@clerk/nextjs", () => ({
  useAuth: vi.fn(() => ({ getToken: vi.fn(async () => "mock-token") })),
}));
```

## Step 5 — Run and verify

After writing each test file, run it:

```bash
cd client && npx vitest run __tests__/path/to/file.test.ts
```

Fix any failures before moving to the next file. Do not leave failing tests.

## Step 6 — Report

For each file:
- Created vs updated
- Number of test cases added
- Pass/fail result from `vitest run`

If a file was intentionally skipped (types, page.tsx, etc.), note it briefly.
