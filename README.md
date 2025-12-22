# 🏦 Core-Flow: Personal Wealth Dashboard

**Core-Flow** is a high-performance financial tracking application designed with industrial banking architecture. It aggregates personal wealth data (Trading, Savings, Crypto) into a unified dashboard with automated tracking capabilities.

## 🎯 Objectives
* **Centralization:** Consolidate distributed assets (IBKR, Bank Accounts) into a single source of truth.
* **Robustness:** Use strict typing and validation (TypeScript/NestJS) to ensure financial data integrity.
* **Scalability:** Built on a PostgreSQL database with Connection Pooling to handle high concurrency.

---

## 🛠 Tech Stack

### Backend Infrastructure
* **Framework:** NestJS (Node.js)
* **Language:** TypeScript (Strict Mode)
* **Database:** PostgreSQL 15 (via Docker)
* **ORM:** Prisma 7.2 (with **pg** Driver Adapter & Connection Pooling)
* **Architecture:** Modular (Controller-Service-Repository pattern)

### Frontend (Coming Soon)
* **Framework:** Next.js
* **Styling:** TailwindCSS + Shadcn/UI

---

## 📂 Project Structure

```bash
core-flow/
├── client/                 # Frontend application (Next.js)
└── server/                 # Backend API (NestJS)
    ├── prisma/
    │   ├── migrations/     # SQL history of database changes
    │   ├── schema.prisma   # Database Data Model
    │   └── seed.ts         # Script to inject initial data ($6,350 setup)
    ├── src/
    │   ├── accounts/       # Accounts Module (The "Vault")
    │   │   ├── dto/        # Data Transfer Objects (Validation)
    │   │   ├── entities/   # Domain models
    │   │   ├── accounts.controller.ts # API Routes
    │   │   └── accounts.service.ts    # Business Logic
    │   ├── prisma/         # Database Connection Module
    │   │   └── prisma.service.ts      # Custom connection pool configuration
    │   ├── app.module.ts   # Main Application Orchestrator
    │   └── main.ts         # Application Entry Point
    ├── docker-compose.yml  # Database Container Configuration
    └── prisma.config.ts    # Prisma 7 Configuration (Seed & Drivers)
```

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** (v18 or higher)
* **Docker Desktop** (Must be running)

### 2. Infrastructure Setup
Start the PostgreSQL database container:
```bash
# From the root /core-flow folder
docker-compose up -d
```

### 3. Backend Installation
Navigate to the server directory and install dependencies (including the Prisma 7 specific drivers):
```bash
cd server
npm install
```

### 4. Environment Configuration
Ensure your `.env` file in `/server` is configured strictly for the connection pool:
```env
# /server/.env
DATABASE_URL="postgresql://admin:password123@localhost:5432/core_flow_db?schema=public"
```

### 5. Database Initialization
Run the migrations to create the tables and generate the Prisma Client:
```bash
# Apply schema to DB and generate type definitions
npx prisma migrate dev --name init
```

### 6. Seeding Data (The "Money Injection")
Inject the initial wealth data (IBKR Trading + Emergency Fund):
```bash
# This uses the configuration in prisma.config.ts
npx prisma db seed
```
*Expected Output:*
> `✅ Created: Interactive Brokers ($2500)`
> `✅ Created: Livret A / LEP (€4000)`

---

## ⚡️ Running the Server

Start the NestJS development server:
```bash
npm run start:dev
```

* **API Health Check:** Open [http://localhost:3000](http://localhost:3000)
* **View Accounts:** Open [http://localhost:3000/accounts](http://localhost:3000/accounts)

---

## 🧠 Key Commands Cheat Sheet

| Command | Description |
| :--- | :--- |
| `npm run start:dev` | Starts the server in watch mode (auto-reload). |
| `npx prisma studio` | Opens a visual GUI to edit database rows manually. |
| `npx prisma generate` | Re-compiles the Prisma Client (Run this if types break). |
| `docker-compose down` | Stops the database container. |

---

## 🗺 Roadmap

- [x] **Phase 1: Backend Core** (Completed)
    - [x] Docker Database Setup
    - [x] Prisma 7 Connection Pooling
    - [x] CRUD API for Accounts
- [ ] **Phase 2: Frontend Dashboard** (Next)
    - [ ] Next.js Setup
    - [ ] Real-time data fetching
    - [ ] Net Worth Visualization Chart
- [ ] **Phase 3: Automation**
    - [ ] Python Scripts to scrape real bank data.