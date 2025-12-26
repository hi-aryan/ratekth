NOTE: the app outlined below was created using Flask, SQLAlchemy, Python, and Bootstrap. i am now refactoring it to use React 19 and Next.js 16.

# rateKTH Project Context

This document outlines the core features, business rules, and functional requirements of the rateKTH application. It serves as the "Source of Truth" for refactoring the project from Flask to Next.js.

## 1. Core Purpose
rateKTH is a social course review platform exclusively for KTH (Royal Institute of Technology) students. It allows students to anonymously review courses they have taken, rate specific aspects (professor, material, peers, workload), and view reviews relevant to their specific academic program.


## 2. Authentication & Identity
* **Strict Access Control**: Only users with a valid `@kth.se` email address can register.
* **Email Verification**: Users cannot log in or post content until they verify their email via a tokenized link sent to their inbox.
* **Anonymity**:
* **Usernames**: Automatically generated based on the student's program code and their user ID (e.g., `CDATE123` for a Computer Science student). Users *cannot* choose their own usernames.
* **Email Privacy**: Emails are never displayed publicly.
* **Account Management**:
* **Password Reset**: Standard secure token flow via email (Request -> Email Link -> Reset Form).
* **Email Change**: Requires verification of the *new* email before updating the record.
* **Profile Picture**: Users select from a predefined list of server-hosted avatars (e.g., `default1.png`). **No custom image uploads allowed.**


## 3. Academic Structure & Course Visibility
The application models the complex hierarchy of KTH academic programs to show students relevant courses.


### Student Types
1. **Base Program Student**: Enrolled in a 3-year Bachelor's or 5-year Master's program (e.g., `CDATE` - 300hp).
* Can later select a specific **Master's Degree** (120hp) embedded in their program.
* Can further select a **Specialization** within that Master's Degree.
2. **Direct Master's Student**: Enrolled directly in a 2-year Master's program (120hp).
* Must select a **Specialization** upon registration (if applicable to the program).


### Course Visibility Logic
A user sees the **UNION** of courses available to:
1. Their **Base Program** (e.g., all CS bachelor courses).
2. Their **Master's Degree** (if selected).
3. Their **Specialization** (if selected).


**Key Rule**: This logic prevents information overload by hiding courses irrelevant to the student's specific track. The "Available Courses" dropdown in the post creation form is filtered by this logic.


## 4. Content (Course Reviews)
* **One Review Per Course**:
* A user can only write *one* review for a specific course.
* **UX Feature**: If a user tries to create a new review for a course they have already reviewed, the system detects this and displays a specific error message with a direct "Edit Existing Review" button.
* **Rating System**:
* **Numeric Ratings (1-5 Stars)**: Professor, Material, Peers.
* **Computed Overall Rating**: The straight average of Professor, Material, and Peers. Calculated dynamically on the frontend for immediate feedback and computed via property on the backend (not stored in DB).
* **Workload Rating**: A distinct Enum field (**Light**, **Medium**, **Heavy**). This does *not* affect the overall numeric star rating.
* **Text Content**: A generic "Comment" field for the review body.
* **Tags**: Users can select up to **3 tags** from a predefined list (e.g., "Good Labs", "Boring Lectures") which carry Positive/Negative sentiment. The frontend strictly enforces this limit. (Maybe backend should enforce this limit too?)
* **Metadata**: Year Taken (manual), Date Posted (auto).


## 5. Navigation & User Experience (UX)
* **Smart Redirects**:
* **Login**: After logging in, users are redirected back to the page they were trying to access (via `next` parameter).
* **Feedback**: Submitting feedback redirects users back to where they came from.
* **Smart Back Buttons**:
* **BackLinkResolver**: The "Back" button on a post detail page logic checks the `return_to` parameter.
* If `return_to` is a safe internal path, it goes there (e.g., back to search results or a specific user profile).
* Fallback: Default to Home.
* **Contextual Actions**:
* **Auto-Select Course**: If a user clicks "Write Review" from a specific Course page (e.g., `/course/ID1018`), the "Create Post" form opens with that course *already selected* in the dropdown (via `?course_id=X` query param).


## 6. Discovery & Search
* **Home Feed**: Displays a paginated list of reviews (5 per page).
* **Search**:
* Users can search for **Courses** by **Name** or **Code** (case-insensitive).
* Results show the course details and the **Review Count** (calculated efficiently via aggregation).
* **Sorting**:
* **Newest**: Default.
* **Top Rated**: Based on the computed Overall Rating.
* **Components of the review**: Professor, Material, Peers, Workload (Light to Heavy).


## 7. Admin & Data Population
* **Scraping**: The system relies on data scraped from KTH's official course web APIs/pages to populate the database with correct **Program** codes, **Course** codes, and their relationships.
* **Data Integrity**: Programs and Courses must exist in the database before users can link to them.


## 8. Summary of Forms & Validation
* **Registration**: complex logic to show/hide "Master's Degree" or "Specialization" fields based on the selected Program type (credits).
* **Create/Update Post**:
* Client-side validation for required fields.
* **Interactive Rating**: Stars light up on hover/click.
* **Real-time Overall Rating**: Updates instantly as user clicks sub-ratings.
* **Tag Limiting**: Javascript prevents checking a 4th tag.