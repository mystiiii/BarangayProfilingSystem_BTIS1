# Barangay Profiling System - Setup Guide

## 1. Configure the Project

Copy the environment template from the root into the `backend` folder:

```bash
cp .envcopy backend/.env
```

Open `backend/.env` and update the database credentials if necessary.

---

## 2. Start the Backend

Navigate to the `backend` directory, install Node dependencies, and start the development server:

```bash
cd backend
npm install
npm run start:dev
```

The backend API will run at: `http://localhost:3000`

---

## 3. Start the Frontend

The frontend is written in static HTML, CSS, and JS. You can serve it using any simple HTTP server:

```bash
# From the project root, run a static server:
npx serve frontend
```

Alternatively, open `frontend/dashboard.html` in your browser or run the **Live Server** extension in VS Code.
