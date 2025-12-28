1. ONLY add 'use client' to the smallest interactive piece: Keep all files in app/, db/, services/, and lib/ as server components (no 'use client'). Only add 'use client' to individual interactive components in components/ui/ and components/forms/ that use useState, onClick, or other browser APIs—never to entire pages or layouts.
2. The goal is readability, not maximum abstraction.
3. Put in JWT (session):
    Data that is:
    Needed frequently (on every page load)
    Rarely changes (stable identity data)
    Small (JWTs have size limits)
    Examples:
    - id (always needed for queries)
    - username (displayed everywhere)
    - email (displayed in nav/header)
    - role (admin/user — for access control)
    - programId (for filtering courses)

    Fetch from DB:
    Data that is:
    Changes often (would make JWT stale)
    Large (bio, settings objects)
    Sensitive (don't want in client-readable token)
    Needed only on specific pages (profile page, settings)
    Examples:
    - Full profile (bio, avatar, preferences)
    - User's reviews/posts
    - Detailed academic info (specialization name, etc.)
