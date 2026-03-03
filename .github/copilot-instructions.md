# Canteen Management System — Copilot Instructions

## Project Overview
Full-stack canteen management app with React frontend, Node.js/Express backend, and MySQL database.

## Tech Stack
- **Frontend:** React 18, Material UI 5, Recharts, React Router 6, Axios
- **Backend:** Node.js, Express 4, JWT, bcryptjs, mysql2
- **Database:** MySQL 8 with triggers and views

## Development Commands
- Backend: `cd backend && npm run dev` (runs on port 5000)
- Frontend: `cd frontend && npm start` (runs on port 3000, proxies API to 5000)
- Seed DB users: `cd backend && npm run seed`

## Architecture
- Backend uses CommonJS modules with Express routers
- Frontend uses React functional components with hooks
- Auth via JWT tokens stored in localStorage
- MUI theme supports light/dark mode toggle
- Role-based access: admin and staff roles

## Key Patterns
- API calls go through `frontend/src/api.js` (axios instance with JWT interceptor)
- Auth state managed via React Context (`AuthContext`)
- Theme state managed via React Context (`ThemeContext`)
- All CRUD pages follow the same pattern: table + dialog form
- Backend routes are in `backend/routes/` with auth middleware

## Database
- Schema in `database/schema.sql` includes triggers for auto-calculating order totals and decreasing stock
- Views for order summary, daily sales, category sales, and low stock alerts

