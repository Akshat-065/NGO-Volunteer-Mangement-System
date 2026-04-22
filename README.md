# NGO Volunteer Management System

A full-stack NGO Volunteer Management System built with React, Tailwind CSS, Node.js, Express, MongoDB, and JWT authentication.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT
- Charts: Recharts

## Features

- Login and signup with JWT authentication
- Role-based access for admins and volunteers
- Admin dashboard with key metrics and activity chart
- Volunteer dashboard with events, joined activities, and profile completion
- Volunteer CRUD management
- Event CRUD management with volunteer assignment
- Application workflow with approve/reject actions
- Profile editing with avatar upload, interests, skills, and availability
- Seed script with ready-to-use demo accounts

## Project Structure

```text
ng/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── .env.example
│   ├── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── package.json
└── README.md
```

## Setup

1. Create a MongoDB database locally or use MongoDB Atlas.
2. Copy `backend/.env.example` to `backend/.env`.
3. Copy `frontend/.env.example` to `frontend/.env`.
4. Update `backend/.env` with your Mongo connection string and JWT secret.

## Architecture

Backend follows a layered MVC-style architecture:

- Routes (HTTP) → Controllers (request/response) → Services (business rules) → Repositories (data access) → Models (Mongoose)
- Validation happens at the route boundary using Zod schemas.
- Errors flow through centralized middleware and return consistent JSON with optional `details`.
- Logging uses Winston and HTTP logging uses Morgan routed into Winston.
- Rate limiting is enabled for `/api` (general) and stricter limits for `/api/auth`.

Frontend follows a component + hooks architecture:

- `components/ui` contains reusable primitives like `Button`, `Card`, `Modal`, and `DataTable`.
- `hooks` contains reusable async/query hooks (`useApiQuery`, `useApiMutation`) used across pages.
- `contexts` contains global state (auth session) using a reducer for scalability.

## Install

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

Or use the helper script:

```bash
npm run install:all
```

## Seed Demo Data

```bash
npm run seed
```

Demo credentials:

- Admin: `admin@ngo.org` / `Admin123!`
- Volunteer: `rohan@ngo.org` / `Volunteer123!`

## Run

Start frontend and backend together:

```bash
npm run dev
```

Or separately:

```bash
npm run dev:backend
npm run dev:frontend
```

Backend default URL: `http://localhost:5000`

Frontend default URL: `http://localhost:5173`

## API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/volunteers`
- `POST /api/volunteers`
- `PUT /api/volunteers/:id`
- `DELETE /api/volunteers/:id`
- `GET /api/events`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `POST /api/apply`
- `GET /api/applications`
- `PUT /api/applications/:id`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/dashboard/stats`

## Notes

- The workspace did not include an actual Figma file or exported design assets, so the UI was implemented as a polished Figma-style dashboard system aligned with the requested layout and behavior.
- Profile image upload is handled as a stored image data URL for local demo simplicity.

## Environment Config

Backend supports environment-based config files via `NODE_ENV`:

- Loads `backend/.env.<NODE_ENV>` if present (example: `backend/.env.production`)
- Falls back to `backend/.env`

## Optional Improvements

- Email notifications for approvals and reminders
- Real-time notifications with websockets
- CSV export for volunteers and events
- More granular analytics and event attendance reporting
- Cloud image storage for profile pictures
