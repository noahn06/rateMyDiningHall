# Product Requirements Document (PRD): RateMyDiningHall

## 1. Project Overview
* **Name:** RateMyDiningHall
* [cite_start]**Description:** A crowdsourced review platform where University of Washington (UW) students can rate and review campus dining locations (dining halls, markets, and cafés)[cite: 4].
* [cite_start]**Core Value:** Quick, trustworthy, student-driven feedback to help students decide where to eat[cite: 5].
* [cite_start]**Target Audience:** University of Washington students (verified via Google OAuth)[cite: 6].

## 2. Core User Flows (MVP)

### A. Authentication (The Gatekeeper)
* [cite_start]**Login:** Users sign in using Google OAuth (Firebase Auth)[cite: 9].
* **Permissions:**
    * [cite_start]**Unauthenticated Users:** Can view dining locations, read reviews, and see ratings[cite: 11, 12, 13].
    * [cite_start]**Authenticated Users:** Can write/edit reviews and create/edit a user profile[cite: 14, 16, 17].
* **Constraints:**
    * [cite_start]A user may submit only **one review per dining location**[cite: 18].
    * [cite_start]Users may edit their existing review at any time[cite: 18].

### B. Dining Location Directory (Home Page)
* [cite_start]**View:** Grid or list of "Dining Location Cards"[cite: 20].
* **Card Content:**
    * [cite_start]Name (e.g., "Center Table", "Local Point")[cite: 21].
    * [cite_start]Thumbnail image[cite: 21].
    * [cite_start]Overall average rating (1.0-5.0 stars)[cite: 25].
    * [cite_start]Total number of reviews[cite: 26].
    * [cite_start]**Badges (Data-driven):** "Late Night Friendly", "Good Value", "Fast Lines"[cite: 27, 28, 29, 30].
* [cite_start]**Sorting Options:** Highest rated, Most reviewed, Best value, Best late-night[cite: 31, 32, 33, 35, 36].
* **Filtering Options:**
    * [cite_start]Campus Area (North / West / Central)[cite: 38].
    * [cite_start]Location Type (Dining Hall / Market / Café)[cite: 39].
    * [cite_start]Dietary-friendly (Veg / Halal / Gluten-free)[cite: 40].

### C. Location Details & Review Page
* [cite_start]**Header:** Location name, image, overall rating, and review count[cite: 46, 49].
* [cite_start]**Stats:** Auto-generated "Best for" tags (e.g., "Big portions")[cite: 50].
* [cite_start]**Category Rating Breakdown:** Visuals for Food quality, Price/value, Portion size, Dietary options, Wait time, Late-night friendliness [cite: 51-57].
* [cite_start]**Review List:** Displays individual reviews sorted by "Newest" (default)[cite: 59, 60].
* **Write a Review Action:**
    * [cite_start]**Logged Out:** Show "Sign in to review" button[cite: 63].
    * [cite_start]**Logged In:** Open the review form/modal[cite: 64].

### D. Review Creation Flow
* [cite_start]**Overall Rating (Required):** 1-5 star rating[cite: 66, 67].
* **Category Ratings (Optional):**
    * [cite_start]Prompt: "What stood out? Pick up to 3"[cite: 69].
    * [cite_start]Categories: Food quality, Price/value, Portion size, Dietary options, Wait time, Late-night friendliness [cite: 70-76].
* [cite_start]**Feedback (Optional):** Short text review (max 350 characters)[cite: 79].
* [cite_start]**Quick Tags (Optional):** "Good after 9pm", "Crowded", "Huge portions", "Not worth the price", "Great vegan options" [cite: 80-85].

### E. User Profile
* [cite_start]**Profile Page:** Displays Google display name, profile photo, total reviews written, and a bio (max 150 chars)[cite: 89, 91, 92, 93].
* [cite_start]**Actions:** Edit bio, view all authored reviews, edit past reviews[cite: 95, 96].

## 3. Data Schema (Firebase Firestore)

### Collection: `dining_locations` (Static Data)
* [cite_start]`name` (string) [cite: 101]
* [cite_start]`type` (string: "dining_hall" | "market" | "cafe") [cite: 102]
* [cite_start]`campus_area` (string: "north" | "west" | "central") [cite: 103]
* [cite_start]`image_url` (string) [cite: 104]
* [cite_start]`avg_rating` (number) [cite: 105]
* [cite_start]`review_count` (number) [cite: 107]
* **Aggregated Ratings:**
    * [cite_start]`food_quality_avg` (number) [cite: 109]
    * [cite_start]`value_avg` (number) [cite: 110]
    * [cite_start]`portion_size_avg` (number) [cite: 111]
    * [cite_start]`dietary_avg` (number) [cite: 112]
    * [cite_start]`wait_time_avg` (number) [cite: 114]
    * [cite_start]`late_night_avg` (number) [cite: 115]

### Collection: `reviews` (User Generated)
* [cite_start]`id` (string: Document ID) [cite: 120]
* [cite_start]`location_id` (string: Reference to `dining_locations`) [cite: 123]
* [cite_start]`user_id` (string: Firebase UID) [cite: 124]
* [cite_start]`user_name` (string) [cite: 125]
* [cite_start]`user_photo` (string) [cite: 126]
* [cite_start]`overall_rating` (number) [cite: 127]
* [cite_start]`category_ratings` (map, optional): `{ food_quality: 5, value: 4, ... }` [cite: 128]
* [cite_start]`tags` (array of strings) [cite: 137]
* [cite_start]`text` (string) [cite: 138]
* [cite_start]`timestamp` (serverTimestamp) [cite: 139]

### Collection: `users`
* [cite_start]`id` (string: Firebase UID) [cite: 144]
* [cite_start]`display_name` (string) [cite: 145]
* [cite_start]`photo_url` (string) [cite: 146]
* [cite_start]`bio` (string) [cite: 146]
* [cite_start]`created_at` (timestamp) [cite: 147]

## 4. Tech Stack & Infrastructure
* [cite_start]**Frontend:** React (Vite) [cite: 150]
* [cite_start]**Styling:** Tailwind CSS (Mobile-first) [cite: 151]
* [cite_start]**Backend:** Firebase (Firestore, Auth) [cite: 152]
* [cite_start]**Hosting:** Vercel [cite: 153]
* [cite_start]**Auth:** Google OAuth [cite: 154]
* [cite_start]**Env Variables:** Must use `VITE_` prefix [cite: 156]

## 5. Future Enhancements (Post-MVP)
* [cite_start]Rankings ("Best late-night", "Best value") [cite: 158]
* [cite_start]Popular times / wait estimates [cite: 159]
* [cite_start]Helpful review upvotes [cite: 160]