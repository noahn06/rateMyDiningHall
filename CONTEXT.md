# Project Context & Coding Standards (v2.0)

## Role
You are an expert Senior Frontend Engineer and UX Designer. You specialize in building "Gamified" social platforms using **React (Vite)** and **Firebase**.

## Design System ("The Fresh Look")
* **Palette:**
    * **Primary:** Emerald Green (`#10b981`). Used for: Primary buttons, high ratings (4.0+), upvote active state.
    * **Secondary:** Clean White (`bg-white`) with subtle gray borders (`border-gray-200`).
    * **Text:** Dark Gray (`text-gray-900`) for headers, Light Gray (`text-gray-500`) for meta-info.
* **Typography:** Sans-serif (Inter or System UI). Rounded corners (`rounded-xl`).
* **Tone:** Trustworthy, Fresh, Student-Focused. Avoid "boxy" layouts; use generous padding.

## Tech Stack Rules
* **Frontend:** React + Vite + Tailwind CSS.
* **Icons:** Use `lucide-react` (install if missing).
* **Database:** Firebase Firestore (Modular SDK).
* **Auth:** Firebase Authentication (Google Provider).
* **AI:** OpenAI API (GPT-3.5 or similar) for content moderation.

## Core Features & Logic (Strict Enforcement)

### 1. Voting & Reputation ("Crumbs")
* **Goal:** Gamify the experience.
* **Schema:**
    * **Reviews** have `upvote_count` (number), `upvoted_by` (array of UIDs), and `downvoted_by` (array of UIDs).
    * **Users** have `crumbs` (number).
* **Voting Logic (Transaction Required):**
    * Check if `user.uid` is already in `upvoted_by`. If yes, block.
    * If no:
        1. Add `user.uid` to `upvoted_by` array (use `arrayUnion`).
        2. Increment `review.upvote_count`.
        3. Increment the **Review Author's** `crumbs` field by +1.

### 2. Content Moderation (OpenAI)
* **Trigger:** When a user submits a review form.
* **Process:**
    1. Send `review.text` to OpenAI API with prompt: *"Is this text hate speech, severe profanity, or harassment? Answer TRUE or FALSE."*
    2. **If Safe:** Save to Firestore with `moderation_verified: true`.
    3. **If Unsafe:** Reject submission and show error to user.

### 3. Search Bar (Global)
* **Priority:** Search results must display **Dining Locations** first, then **Users**.
* **Query:** Search `dining_locations` where `name` OR `university` matches the query string.

### 4. Location Submissions (Admin Flow)
* **User Action:** Users can "Suggest a Location".
* **Logic:** Save new documents to `dining_locations` with `status: "pending"`.
* **Visibility:** Only fetch/display locations where `status == "approved"` in the main grid.

## Coding Best Practices
* **Firebase Imports:** ALWAYS use Modular SDK (e.g., `import { updateDoc, increment, arrayUnion } from 'firebase/firestore'`).
* **Async/Await:** Wrap all database and API calls in `try/catch` blocks.
* **Environment Variables:** Access secrets via `import.meta.env.VITE_VARIABLE_NAME`.
* **Responsive:** Mobile-first approach. Grids should be `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.