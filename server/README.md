# AI-Powered Notes Management System - Backend (Server)

Ek lightweight, production-ready REST API backend jo **Node.js**, **Express**, **MongoDB (Mongoose)**, aur **JWT Authentication** par bana hai. Isme AI-Powered **Semantic Search**, **AI Note Summarization**, **Pagination**, aur **Docker Setup** implemented hai.

Folder structure bilkul **NOVA_PRODUCTS** ke pattern par banaya gaya hai taaki code samajhna aur interview me explain karna behad aasan ho.

---

## 📁 Folder Structure

```
server/
├── Dockerfile                  # Docker build instructions
├── docker-compose.yml          # Node app + MongoDB container orchestration
├── package.json                # Project dependencies & scripts
├── server.js                   # Application Entrypoint (app.listen)
├── .env                        # Environment variables
├── .env.example                # Sample environment file
├── AI_Notes_API.postman_collection.json  # Ready-to-import Postman collection
└── src/
    ├── app.js                  # Express setup, CORS, JSON parser, routes mounting
    ├── config/
    │   ├── config.js           # Env variables configuration
    │   └── db_conn.js          # MongoDB connection handler
    ├── middleware/
    │   └── auth.middleware.js  # JWT Bearer token verification
    ├── models/
    │   ├── user.model.js       # User Schema (name, email, password)
    │   └── note.model.js       # Note Schema (title, content, tags, category, ai_summary)
    ├── modules/
    │   ├── auth/
    │   │   ├── auth.controller.js  # Register, Login, Profile controllers
    │   │   └── auth.router.js      # Auth routes
    │   └── notes/
    │       ├── notes.controller.js # CRUD, Pagination, AI Summary, Semantic Search
    │       └── notes.router.js     # Notes routes
    └── utils/
        ├── aiHelper.js         # AI Summarization & Cosine Similarity Semantic Search
        ├── asyncHandler.js     # Try-catch async wrapper
        └── genToken.js         # JWT Token generator
```

---

## 🗄️ Database Schema

### 1. User Schema (`src/models/user.model.js`)
| Field | Type | Description |
|---|---|---|
| `name` | String | User ka full name |
| `email` | String | Unique email address (lowercase) |
| `password` | String | Bcrypt se hashed password |
| `createdAt` / `updatedAt` | Date | Timestamps |

### 2. Note Schema (`src/models/note.model.js`)
| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | Reference to `User` model |
| `title` | String | Note ka title |
| `content` | String | Note ki complete details |
| `tags` | Array of Strings | Tags (e.g. `["work", "meeting"]`) |
| `category` | String | Note category (Default: `general`) |
| `ai_summary` | String | AI dwara generate ki gayi concise summary |
| `createdAt` / `updatedAt` | Date | Timestamps |

---

## 🚀 Setup & Installation

### Option A: Local Run (Bina Docker ke)

1. **Install Dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Environment File Check Karein (`.env`):**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ai_notes_db
   JWT_SECRET=my_super_secret_jwt_key_2026
   GEMINI_API_KEY=your_optional_gemini_key
   ```

3. **Development Server Start:**
   ```bash
   npm run dev
   # ya production mode:
   npm start
   ```
   Server `http://localhost:5000` par run ho jayega.

---

### Option B: Docker Setup (Bonus Point)

Docker se Node server aur MongoDB dono ek single command se start ho jaate hain:

```bash
docker compose up --build
```
- Node Server: `http://localhost:5000`
- MongoDB: `localhost:27017`

Band karne ke liye:
```bash
docker compose down
```

---

## 📡 API Endpoints Guide

Saare protected routes ke liye header bhejein:
```
Authorization: Bearer <your_jwt_token>
```

### 1. Authentication Routes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Naya account banayein (name, email, password) |
| `POST` | `/api/v1/auth/login` | Login karein aur JWT token paayein |
| `GET` | `/api/v1/auth/profile` | Logged-in user ki details paayein (Protected) |

### 2. Notes CRUD Routes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/notes` | Naya note banayein |
| `GET` | `/api/v1/notes?page=1&limit=10` | Paginated notes list |
| `GET` | `/api/v1/notes/:id` | Single note fetch karein by ID |
| `PUT` | `/api/v1/notes/:id` | Note update karein |
| `DELETE` | `/api/v1/notes/:id` | Note delete karein |

### 3. AI Features (Assignment Specific)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/notes/:id/summary` | **AI Summary Endpoint**: Note ka content padh kar 2-sentence AI summary generate karke database me save karta hai. |
| `GET` | `/api/v1/notes/search/semantic?q=...` | **Semantic Search**: Cosine similarity calculate karke user ke query se meaning-wise match hone wale notes return karta hai. |

---

## 🤖 AI Implementation Explanation (Interview ke liye)

### 1. AI Summary Endpoint (`POST /api/notes/:id/summary`)
- Jab user kisi note ID par summary request karta hai, controller note ka `content` leta hai.
- Agar `.env` me `GEMINI_API_KEY` set hai, toh seedha **Google Gemini API** (`gemini-1.5-flash`) ko call karke high-quality concise summary milti hai.
- Agar API key nahi hai ya offline hai, toh system ka built-in **smart NLP sentence ranker** content ke top-2 most informative sentences nikaal deta hai, jisse endpoint kabhi fail nahi hota!
- Summary `note.ai_summary` me save ho jaati hai.

### 2. Semantic Search (`GET /api/notes/search/semantic?q=...`)
- Traditional search sirf exact word match karta hai (`regex`).
- Semantic search user ke search query ka **Word Frequency Vector** banata hai aur har note ke text vector ke sath **Cosine Similarity**:
  $$\text{Cosine Similarity} = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$
  calculate karta hai.
- Highest matching score wale notes sabse upar rank hokar user ko milte hain.

---

## 🐳 Docker Explanation (Interview me kya bolna hai)

1. **Dockerfile:**
   - `FROM node:18-alpine` — Ek lightweight Linux environment leta hai jisme Node.js installed hai.
   - `COPY package*.json ./` aur `RUN npm install` — Project dependencies install karta hai.
   - `COPY . .` — Hamara application code container ke andar copy karta hai.
   - `EXPOSE 5000` — Port 5000 allow karta hai.
   - `CMD ["npm", "start"]` — Container start hote hi server run karta hai.

2. **docker-compose.yml:**
   - Yeh ek orchestration tool hai jo hamare **Node.js Backend** aur **MongoDB Database** ko 2 separate containers me start karta hai aur unhe ek hi network me connect kar deta hai.
   - Persistent data ke liye `mongo-data` volume banaya gaya hai taki container band hone par bhi MongoDB ka data delete na ho.

---

## 🛠️ Testing with Postman

1. Postman kholein.
2. `Import` button par click karein aur `server/AI_Notes_API.postman_collection.json` select karein.
3. Collection variable `baseUrl` already `http://localhost:5000` set hai.
4. Pehle `Register` ya `Login` request run karein, JWT token automatically save ho jayega aur baaki sabhi requests me lag jayega.

