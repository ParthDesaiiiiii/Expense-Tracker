# Expense Tracker — Professional Full-Stack (LocalStorage)

This repository contains a professional, startup-style Expense Tracker web application.

Overview
- Frontend: React + Vite (localStorage persistence, Recharts, Framer Motion)
- Backend: Node.js + Express (single endpoint POST /api/recommendations)
- No database — all user data is stored in localStorage

Quick start

1) Backend

cd backend
npm install
npm start

Server will run on http://localhost:4000

2) Frontend

cd frontend
npm install
npm run dev

App will run on http://localhost:5173 (Vite default)

Notes
- The frontend stores transactions and settings in localStorage and syncs on load.
- The backend exposes a single API POST /api/recommendations which returns rule-based financial suggestions.

Files of interest
- backend/index.js — Express server
- frontend/src — React app

Design & features
- Dashboard with balance cards
- Income & expense CRUD
- Category pie chart + monthly bar chart (Recharts)
- Sidebar, dark mode, Framer Motion animations
- Professional SaaS styling (glassmorphism) and responsive layout

Feel free to run both parts locally and open an issue if anything needs polishing.
