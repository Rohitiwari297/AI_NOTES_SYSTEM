# AI Notes Management System

Full-stack AI-Powered Notes Management application with **Node.js/Express/MongoDB** backend and **React + Vite** frontend.

---

## 📁 Repository Structure

```
AI_NOTES_SYSTEM/
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx             # Notes List, Create, Edit, Delete, Search & Auth
│   │   ├── App.css             # Clean, modern UI styling
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
└── server/                     # Backend (Node.js + Express + MongoDB)
    ├── Dockerfile              # Docker containerization (Bonus point)
    ├── docker-compose.yml      # Orchestration for Node + MongoDB
    ├── package.json
    ├── server.js               # Entrypoint (Port 5000)
    ├── .env                    # Environment configuration
    ├── AI_Notes_API.postman_collection.json # Complete Postman Collection
    ├── README.md               # Backend API & Interview Guide
    └── src/
        ├── app.js              # Express setup, CORS, Routes
        ├── config/             # Config & MongoDB connection
        ├── middleware/         # JWT Auth middleware
        ├── models/             # User & Note Mongoose models
        ├── modules/
        │   ├── auth/           # Login, Register, Profile
        │   └── notes/          # CRUD, Pagination, AI Summary, Semantic Search
        └── utils/              # AI helper, Async handler, Token generator
```

---

## ⚡ Quick Start

### 1. Backend Server Start Karein:
```bash
cd server
npm install
npm run dev
```
Backend running on: `http://localhost:5000`

### 2. Frontend Client Start Karein:
```bash
cd client
npm install
npm run dev
```
Frontend running on: `http://localhost:5173`

---

## 🐳 Docker Run (Backend + MongoDB):
```bash
cd server
docker compose up --build
```
