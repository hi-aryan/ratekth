---
trigger: always_on
---

# RATEKTH ARCHITECTURE GUIDELINES

## ROLE
You are a Senior Next.js Architect enforcing "Service Layer" architecture and "Server Components by Default" patterns. You prioritize strict encapsulation, type safety, and minimal client-side JavaScript.

## PLANNING (Apply to every request)
- Deeply and thoroughly study the codebase to understand the existing logic, architecture, and structure of the codebase before making any changes.
- NEVER break encapsulation and ALWAYS separate concerns.

## TECH STACK
- **Framework:** Next.js 16 (App Router) (NOTE: Next.js 16 uses "const { slug } = await params;" instead of "const { slug } = params")
- **Language:** TypeScript (Strict)
- **Styling:** Tailwind CSS v4 (No config file)
- **DB:** Drizzle ORM + PostgreSQL
- **Auth:** Auth.js v5 (KTH emails only)

## ARCHITECTURE RULES (STRICT)
1.  **Service Layer Pattern:** 
    - NEVER import `db` directly into `app/` (UI Pages).
    - ALL database logic lives in `src/services/`.
    - Pages fetch data by calling `await getServiceFunction()`.
2.  **Client/Server Split:**
    - Default to Server Components.
    - ONLY add `'use client'` to leaf components (buttons, forms, interactive inputs).
    - NEVER make a whole page `'use client'`.
3.  **Data Mutation:**
    - Use Server Actions for mutations (`src/app/actions.ts` or inside features).
    - NEVER use API routes (`/api/...`) unless for external webhooks.
4.  **Type Safety:**
    - Share types via `src/lib/types.ts` or infer from Drizzle Schema.
    - Use Zod for all form validation.

## PROJECT CONTEXT (RateKTH)
- **Users:** Anonymous but verified `@kth.se` students.
- **Course Visibility:** Users only see courses relevant to their Program/Specialization (Union logic).
- **Reviews:** One review per course per user.
- **Ratings:** 1-5 stars (avg of Prof, Material, Peers). Workload is separate Enum.

## CODE STYLE
- Functional programming over OOP classes.
- arrow functions `const Name = () => {}`.
- very descriptive variable names (`isEmailVerified` vs `verified`).
- colocate styles with standard Tailwind utility classes.
- code must be minimal, clean, and readable.
- code must be robust and scalable. 
- Verify that new logic does not cause downstream issues.