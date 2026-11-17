# Luweero District Agricultural Management System

A NoSQL MongoDB & Express web application for managing agricultural records across Luweero District Local Government (Uganda), including registered farmers, farm landholdings, crop/livestock production, produce market transactions, and extension advisory visits.

---

## 📁 Project Architecture & Directory Structure

```
luweero_agri_db/
├── client/                     # 🌐 FRONTEND (Client)
│   └── index.html              # Single-page dashboard, Bootstrap Icons, charts, receipt & PDF print engine
├── server/                     # ⚙️ BACKEND (Server)
│   ├── server.js               # Express API backend, static asset server, CRUD endpoints, CSV stream
│   ├── seed.js                 # Native Node.js database seeder (runs anywhere including Render & Atlas)
│   ├── seed_database.js        # MongoDB shell database seed script (mongosh)
│   └── queries.js              # Assignment queries (mongosh)
├── .env.example                # Template for environment variables
├── .gitignore                  # Git ignore rules for node_modules, env, logs
├── package.json                # Project dependencies and unified scripts
├── render.yaml                 # Render Blueprint for automated deployment
└── server.js                   # Root compatibility bridge delegating to server/server.js
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional for Local)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default local settings:
- `PORT=3000`
- `MONGODB_URI=mongodb://127.0.0.1:27017`
- `DB_NAME=luweero_agri_db`

### 3. Seed the Database
Populate sample farmers, farms, crops, market sales, and extension visits:
```bash
# Option A: Universal Node.js seeder (no mongosh required)
npm run seed

# Option B: MongoDB shell seeder
npm run seed:mongo
```

### 4. Start the Application
```bash
npm start
```
Open your browser and visit:
👉 **`http://localhost:3000`**

*(Note: running `node server/server.js` or `node server.js` will also work seamlessly)*

---

## ☁️ Deploying to Render (Hosting Guide)

This repository is pre-configured for one-click deployment on [Render](https://render.com/).

### Method 1: Web Service via Render Dashboard
1. Push this project to your GitHub or GitLab repository.
2. Log in to [Render](https://dashboard.render.com/) and click **New +** → **Web Service**.
3. Select your repository.
4. Configure the settings:
   - **Name**: `luweero-agri-db`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (e.g., `mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/luweero_agri_db?retryWrites=true&w=majority`)
   - `DB_NAME`: `luweero_agri_db`
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**.

### Method 2: Render Blueprint (`render.yaml`)
1. Click **New +** → **Blueprint** in the Render Dashboard.
2. Select this repository.
3. Render reads `render.yaml` automatically and prompts you for your `MONGODB_URI`.
4. Click **Apply**.

### Post-Deployment Seeding (Remote MongoDB Atlas)
To seed your remote MongoDB Atlas database from your local terminal:
```bash
MONGODB_URI="your_mongodb_atlas_connection_string" npm run seed
```

---

## 🛠️ API & System Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves the frontend single-page dashboard (`client/index.html`) |
| `GET` | `/api/health` | Health check endpoint for uptime and monitoring |
| `GET` | `/api/stats` | Executive KPI figures and aggregate counts |
| `GET` | `/api/farmers` | Farmer directory (supports single GET, POST, PUT, DELETE) |
| `GET` | `/api/farms` | Farm landholdings (supports single GET, POST, PUT, DELETE) |
| `GET` | `/api/crops` | Crop & livestock records (supports single GET, POST, PUT, DELETE) |
| `GET` | `/api/transactions`| Produce sales & vouchers (supports single GET, POST, PUT, DELETE) |
| `GET` | `/api/visits` | Extension advisory visits (supports single GET, POST, PUT, DELETE) |
| `GET` | `/api/export/:col/csv` | Streams RFC-4180 UTF-8 BOM CSV for any collection |

