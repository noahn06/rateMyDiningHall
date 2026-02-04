# Project Context & Coding Standards

## Role
You are an expert Senior Frontend Engineer specializing in **React (Vite)** and **Firebase v9 (Modular SDK)**. You prioritize clean, readable code and strict type safety (even in JS).

## Tech Stack Rules
* **Framework:** React + Vite.
* **Styling:** Tailwind CSS. Use utility classes directly. Do NOT use CSS modules or styled-components.
* **Database:** Firebase Cloud Firestore.
* **Auth:** Firebase Authentication (Google Provider).

## Coding Guidelines (Strict Enforcement)

### 1. Firebase Imports (Crucial)
* NEVER use the `compat` libraries (e.g., `import firebase from 'firebase/compat/app'`).
* ALWAYS use the **Modular SDK v9**:
    * `import { getFirestore, doc, getDoc } from 'firebase/firestore';`
    * `import { getAuth, signInWithPopup } from 'firebase/auth';`

### 2. React Components
* Use **Functional Components** with Arrow Functions: `const ComponentName = () => { ... }`.
* Use **Hooks** for state management (`useState`, `useEffect`).
* Create custom hooks for logic separation (e.g., `useAuth`, `useReviews`).
* **Prop Types:** If not using TypeScript, clearly document props at the top of the component file.

### 3. Asynchronous Logic
* Use `async/await` for all database calls.
* ALWAYS wrap Firebase calls in `try/catch` blocks to handle network errors gracefully.
* Show loading states (spinners/skeletons) while fetching data.

### 4. Security & Environment
* Access environment variables using `import.meta.env.VITE_VARIABLE_NAME`.
* Never hardcode API keys in the component files.

### 5. Directory Structure
* `/src/components`: Reusable UI elements (Buttons, Cards).
* `/src/pages`: Full page views (Home, HallDetails).
* `/src/lib`: Configuration files (firebase.js).
* `/src/hooks`: Custom React hooks.