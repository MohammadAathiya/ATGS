# ATGS Backend (Express + MongoDB)

## Setup
1. Copy `.env.example` to `.env` and set values:
```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/atgs
JWT_SECRET=change_me
```

2. Install dependencies:
```
npm install
```

3. Run dev server:
```
npm run dev
```

API base URL: `http://localhost:4000/api`

For the frontend, set:
```
VITE_API_URL=http://localhost:4000/api
```

## Endpoints
- POST `/api/auth/signup` { name, email, password, role }
- POST `/api/auth/login` { email, password }
- GET/POST/PUT/DELETE `/api/faculty`
- GET/POST/PUT/DELETE `/api/courses`
- GET/POST/PUT/DELETE `/api/rooms`
- POST `/api/upload/:key` with body `{ data: [...] }` where key is `courses|faculty|classrooms|departments|sections`
- GET `/api/timetable` fetch latest
- POST `/api/timetable/generate` generate from DB
- GET `/api/export/csv` download CSV
- GET `/api/export/pdf` download PDF

## Notes
- Socket.io is enabled on the same host. Frontend listens for `notify` events.
- Timetable generation uses a backtracking scheduler with constraints (faculty availability, workload, room type, section/day/slot conflicts).
