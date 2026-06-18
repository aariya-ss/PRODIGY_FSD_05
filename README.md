# SmartBuy E-Commerce

This repository contains a local e-commerce application built with:
- Backend: FastAPI
- Frontend: React + Vite
- Database: SQLite

## Project structure

- `backend/` - FastAPI backend with API routes, authentication, and database models
- `frontend/` - React client application using Vite
- `local_ecommerce.db` - Local SQLite database file

## Requirements

- Python 3.11+ (or compatible)
- Node.js 18+ and npm

## Backend setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

The backend will seed sample products and an admin user at startup if the database is empty.

## Frontend setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

The frontend expects the backend API to be available on `http://localhost:8000`.

## Local admin login

The backend seeds an initial admin user with phone number:
- `+919999999999`

Use this account to access any admin functionality in the app.

## Notes

- If you want to avoid committing dependencies in the future, add a `.gitignore` file and exclude `frontend/node_modules/` and the SQLite database file.
- The backend exposes API routes under `/api`.

## License

This repository does not include a license file. Add one if you want to publish the project publicly.
