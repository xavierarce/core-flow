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