# diet-dash-ai-frontend

Single-page Next.js form that collects a client's data, sends it to the Diet Dash AI service and renders the generated one-day meal plan.

## Context

Part of the Diet Dash startup (2024-2025), now closed. This repository is the frontend of an AI meal-plan generation experiment, archived as a portfolio piece (tag: `pre-ai`).
The current, final version is a separate monorepo (Hono + React): https://github.com/Sentimenta1ist/diet-dash

## Features

- Form: gender, age, height, weight, weight goal (loss, maintain, gain, custom), meals per day, free-text comments
- "Custom targets" goal reveals calorie and macro (protein, carbs, fat) inputs
- Client-side validation gates the submit button
- Loading state with an AI assistant persona ("Rina"), error handling with a specific message for CORS failures
- Result view: calories, macros and estimated daily cost cards, a meals table (product, amount, calories, P/C/F) and notes

## API overview

The app has one page (`/`) and calls one external endpoint.

| Method | Endpoint | Used for |
|--------|----------|----------|
| POST | `<AI service>/api/generate` | Sends `gender`, `age`, `height_cm`, `weight_kg`, `weightGoal`, optional `target{calories, protein_g, carbs_g, fat_g}`, `mealsCount`, `comments`; expects `dailyCalories`, `macros`, `meals[]`, `notes`, `estimatedCostEUR` |

The service URL is hardcoded in `app/page.tsx` (a tunnel address), not read from an environment variable.

## Architecture

```
Browser (Next.js page, client component) --fetch POST /api/generate--> diet-dash-ai (Spring) --> OpenAI
```

No backend routes, database or auth in this repo.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.4 (App Router), React 19.1 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Tooling | ESLint 9 with `eslint-config-next` |

## Run locally

Requirements: Node.js and npm (no Dockerfile, no environment variables).

1. Run the companion service from the `diet-dash-ai` repo (needs `OPENAI_API_KEY`).
2. In `app/page.tsx`, change the `fetch(...)` URL to your service, for example `http://localhost:8080/api/generate`, and remove the tunnel-specific `ngrok-skip-browser-warning` header if you like.
3. `npm install`
4. `npm run dev` and open http://localhost:3000 (`npm run build` and `npm start` for production).

## Interesting bits

- Reusable `NumberField` and a hand-built `CustomDropdown` (outside-click handling via refs) instead of a UI library.
- The request payload is assembled conditionally: the `target` object is only sent for the "custom" goal, otherwise the backend asks the model to infer targets.
- Result rendering tolerates partial model output (optional chaining, fallbacks for missing macros, cost and notes).
- `app/test` is an extensionless copy of an earlier draft of the page component kept in the tree.

---
Written before AI coding assistants. Archived as-is.
