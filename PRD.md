# Product Requirements Document (PRD): RateMyDiningHall (v2.0)

## 1. Project Overview
* **Name:** RateMyDiningHall
* **Description:** A crowdsourced review platform for university dining. Students verify via Google OAuth to rate food, while an admin system ensures quality.
* **Core Value:** Trustworthy, student-verified feedback with a gamified reputation system.
* **Target Audience:** University students (verified via Google OAuth).
* **Design Theme:** "Fresh & Clean" – White backgrounds with **Emerald/Forest Green** accents (`#10b981`) and black text.

## 2. Core User Flows

### A. Global Navigation & Footer
* **Navbar:**
    * **Search Bar (Global):**
        * *Priority:* Searches `dining_locations` by name (e.g., "Center Table") FIRST.
        * *Secondary:* Searches `users` by display name SECOND.
        * *Action:* Clicking a result navigates to `/hall/:id` or `/user/:id`.
    * **User Menu:** Avatar with dropdown (Profile, Settings, Logout).
* **Footer:**
    * Links: About Us | Contact | Terms & Conditions | Bug Report.
    * Copyright © 2026 RateMyDiningHall.

### B. Dining Location Directory (Home)
* **View:** Grid of cards (`DiningHallCard`).
* **Data Integrity:** Display **REAL** calculated averages and review counts from Firestore.
* **Card UI:** White card, slight shadow, green rating badge.
* **Action:** "Suggest a Missing Location" button.

### C. Location Submission (User > Admin Flow)
* **User Flow:** User clicks "Suggest Location" -> Fills form (Name, University, Type, Image URL).
* **Backend Logic:**
    * New location is saved to `dining_locations` with `status: "pending"`.
    * *Constraint:* Pending locations do NOT appear in the main search or home grid until approved.
* **Admin Dashboard:** Specific users (`is_admin: true`) can Approve/Reject pending locations.

### D. Reviews & Moderation
* **Creation Flow:**
    * **Moderation (OpenAI):** Before submission, review text is sent to OpenAI API.
        * *Prompt:* "Does this text contain hate speech, severe profanity, or harassment?"
        * *Result:* If flagged, block submission and

## 5. Future Enhancements (Post-MVP)
* [cite_start]Rankings ("Best late-night", "Best value") [cite: 158]
* [cite_start]Popular times / wait estimates [cite: 159]
* [cite_start]Helpful review upvotes [cite: 160]