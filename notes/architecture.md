## 1. src/app/ (The "View" & "Router" Layer)
Purpose: Defines URLs and renders the initial server-side HTML. It is the "entry point" for the user.

Use error.tsx file (Next.js Error Boundary) to catch unexpected crashes (like DB connection failure) that happen during server rendering.

(auth)/: Route Group. Login/Register pages using the Auth Layout.

(dashboard)/: Route Group. Main app pages (Feed, Course, Profile) using the Dashboard Layout.

api/: Webhooks Only. (e.g., Database webhooks). Do not build your own API here.

layout.tsx: Global shell (HTML/Body, Fonts, Toast Providers).

page.tsx: The Root Feed.

Rule: Files here should be "dumb". They await data from services/ and pass it to components/. No complex logic.

## 2. src/actions/ (The "Controller" Layer)
Purpose: The bridge between the Client (Forms) and the Server (Services). These are Server Actions ("use server").

Catch errors here inside a try/catch block. Return a structured object to the client: return { success: false, error: "Invalid credentials" }. (This prevents the Next.js app from crashing and allows the frontend form (useActionState) to display a nice red error message to the user. Never let a raw error bubble up from an Action to the Client.)

auth.ts: loginAction, logoutAction. Handles FormData parsing, Zod validation, and calls Auth Service.

reviews.ts: submitReviewAction. Receives raw form data -> Validates (Zod) -> Calls services/reviews.createReview().

user.ts: updateProfileAction. Handles profile picture changes.

Rule: This is the only place that deals with FormData or revalidatePath(). It sanitizes input before it touches your clean business logic.

Input Validation: Always validate FormData using Zod schemas (from src/lib/validation.ts) here before calling any Service.

## 3. src/services/ (The "Model" / Logic Layer)
Purpose: Pure Business Logic and Database Queries. The "Source of Truth".

Throw specific errors here (e.g., throw new Error("Course not found") or custom class CourseNotFoundError extends Error). (Services should simply fail if business rules are violated. They should not know about UI redirection or HTTP status codes.)

auth.ts: verifyKthEmail(), createUser().

courses.ts: getAvailableCourses(studentId), getCourseById(). (Complex Union Logic lives here).

reviews.ts: createReview(data), getReviewsForCourse(). (Rating calculations live here).

feed.ts: getStudentFeed().

Rule: The only folder allowed to import db. Functions here return plain JS objects, not Response objects.

Authorization: Perform permission checks here (e.g., if (existingReview) throw new Error("Already reviewed")). Do not rely on the UI.

DTOs (Data Transfer Objects): Ensure functions return safe, clean objects (e.g., exclude sensitive fields like passwords and such things) before returning data to the Controller/View. Do not validate data coming out of the DB (trust the schema types).

## 4. src/db/ (The "Backbone" / Data Layer)
Purpose: Definitions of Data. No logic.

schema.ts: Tables (users, courses, reviews) and Enums.

relations.ts: Drizzle relationships (One-to-Many definitions).

index.ts: Database connection instance.

## 5. src/components/ (The "UI" Layer)
Purpose: Visual elements.

ui/: Primitives. Buttons, Badges, Modals (Shadcn).

forms/: Interactive Forms. (use client).

Example: LoginForm.tsx imports loginAction from src/actions/auth.ts.

features/: Domain Components.

Example: ReviewCard.tsx, CourseHeader.tsx. These display data passed from src/app/.

## 6. src/lib/ (The "Toolbox")
Purpose: Helpers, Config, and Types.

validation.ts: Zod Schemas. (Shared by actions/ and components/forms/).

types.ts: TS Interfaces. (Shared by services/ and components/).

utils.ts: CSS helpers.

mail.ts: Email config.

