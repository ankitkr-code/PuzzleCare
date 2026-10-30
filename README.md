# PuzzleCare — Memory-Match Game for Alzheimer's Patients

A full-stack starter project: a caregiver creates an account, uploads familiar
photos of their patient, and the patient plays a level-based memory-match game
built from those photos. Pairs grow with each level.

- **Backend:** Spring Boot 4 / Java 17 / Maven, JWT auth, MySQL
- **Frontend:** React (Vite) + Tailwind CSS v4 + react-router-dom, responsive

## Prerequisites

- **JDK 17+** (`java -version`)
- **MySQL 8** running locally, with a `puzzle_game` database
  (the app also works with `createDatabaseIfNotExist=true`, so it can create it itself)
- **Node.js 18+** (`node --version`)

## Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

Runs on `http://localhost:8080`. Tables are auto-created
(`spring.jpa.hibernate.ddl-auto=update`). Update the DB username/password in
`src/main/resources/application.properties` if yours differ from `root`/`root`.

Uploaded photos are stored on disk under `uploads/{userId}/` (created
automatically on first upload), with one row per photo in the `images` table.

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:5173`. The frontend talks to the backend at
`http://localhost:8080` (CORS is already enabled for the Vite dev server).

## API endpoints

| Method | Path                  | Auth | Description                          |
|--------|-----------------------|------|--------------------------------------|
| POST   | `/api/auth/register`  | no   | Create account → returns JWT         |
| POST   | `/api/auth/login`     | no   | Log in → returns JWT                 |
| POST   | `/api/images`         | yes  | Upload a photo (multipart `file`)    |
| GET    | `/api/images`         | yes  | List your photos                      |
| GET    | `/api/images/{id}/file` | yes | Download one of your photos (ownership checked) |
| DELETE | `/api/images/{id}`    | yes  | Delete your photo (file + DB row)    |

All protected endpoints need `Authorization: Bearer <token>`.

## Project layout

```
puzzle-game/
├── backend/   # Spring Boot: auth, JWT, image upload/storage
└── frontend/  # React: login/register, dashboard, upload, memory-match game
```

## Notes / simplifications

- Level difficulty (pairs per level: 4 / 6 / 8) is a placeholder constant in
  `frontend/src/pages/Game.jsx` — the PRD calls for it to move into a
  backend-hidden config later.
- One account = one patient; image rows are always scoped to the logged-in
  user (`uploads/{userId}/` + ownership checks on every read/delete).
- The JWT secret in `application.properties` was randomly generated at
  scaffold time — generate a fresh one for any real deployment.
