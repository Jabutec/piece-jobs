# Piece Jobs

A lean job board for **piece jobs** (short, casual work) in the Vaal region of South Africa. Someone posts a job, a worker taps **I’m interested**, and the conversation moves straight to WhatsApp.

**Live demo:** [add link after deploy]
**Built by:** Jabulani ([@Jabutec](https://github.com/Jabutec)) as a six-day MVP

---

## The problem

Piece jobs in South Africa are mostly found through Facebook groups and word of mouth. Posts get buried, there is no way to filter by area, and workers have to hunt through comments to reach the person hiring.

## The solution

A single page where:

- **Posters** share a job in under a minute: what, where, pay, when, and their WhatsApp number.
- **Workers** browse by area or keyword and tap **I’m interested**, which opens WhatsApp with a message already written.

There are no accounts, no payments and no chat system. WhatsApp already does that job and everyone already uses it.

## Features

- Browse the newest jobs (latest 100)
- Filter by Vaal town or township, and search by keyword
- Post a job through a short form
- One-tap WhatsApp contact with a pre-filled message
- South African phone numbers are cleaned up and validated on the server (`082 123 4567` becomes `27821234567`)
- Responsive layout, designed mobile-first

## Tech stack

| Layer    | Choice                                     |
| -------- | ------------------------------------------ |
| Frontend | React (Vite), Tailwind CSS                 |
| Backend  | Python, FastAPI                            |
| Database | Supabase (Postgres)                        |
| Hosting  | [add: frontend host] / [add: backend host] |

```
React (browser)  →  FastAPI  →  Supabase (Postgres)
```

The browser never talks to the database directly. Row Level Security is switched on with no public policies, and the Supabase secret key lives only in the backend’s environment.

## API

| Method | Path      | Description                          |
| ------ | --------- | ------------------------------------ |
| GET    | `/health` | Health check                         |
| GET    | `/jobs`   | List the 100 newest jobs             |
| POST   | `/jobs`   | Create a job (validated server-side) |

Interactive docs are available at `/docs` when the backend is running.

## Run it locally

**Requirements:** Python 3.10+, Node.js (LTS), and a free [Supabase](https://supabase.com) project.

### 1. Database

Run this in the Supabase SQL Editor:

```sql
create table jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  area text not null,
  pay text not null,
  when_text text not null,
  poster_name text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

alter table jobs enable row level security;
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-secret-key
```

Then start the server:

```bash
uvicorn main:app --reload
```

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_API_URL=http://127.0.0.1:8000
```

Then start the app and open `http://localhost:5173`:

```bash
npm run dev
```

## Decisions and trade-offs

The brief was a rough MVP in six days, so I left things out on purpose:

- **No user accounts.** They would add days of work, and WhatsApp already handles identity and contact.
- **A fixed list of towns instead of GPS.** A dropdown of Vaal areas keeps the data clean and needs no coordinates, maps or location permissions.
- **FastAPI between the app and the database.** It keeps the secret key off the browser and gives one place for validation.
- **Plain React with Vite, not Next.js.** It is a single page, so server rendering and routing would be unnecessary.

## Validation

[Fill this in with real numbers from your Facebook research and launch: how many people you spoke to, what they said, how many jobs were posted and how many “I’m interested” taps came in.]

## Roadmap

Ideas I intentionally did not build for the MVP:

- Distance-based “jobs near me”
- Job categories (including tutoring and other services)
- Ways for posters to close a job once it is filled
- Trust and safety features, such as reporting and verified posters
- Server-side check of the area against the allowed list
- Rate limiting on posting

## Author

Jabulani, Software Developer
