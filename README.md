# PRODIGY_FSD_05

A full-stack local e-commerce platform built with React, Vite, FastAPI, and SQLAlchemy. The project includes a customer-facing storefront, cart and checkout flows, profile and order management, and an admin dashboard for product control.

## Overview

This repository contains:
- A React frontend built with Vite and React Router
- A FastAPI backend with REST endpoints for products, orders, and profiles
- SQLAlchemy models and SQLite-based local development database support
- Supabase-auth-inspired client integration for sign-in and protected routes

## Project Structure

- frontend/: Vite + React application
- backend/: FastAPI server, routes, models, schemas, and database setup

## Features

- Product listing and product detail pages
- Shopping cart and checkout experience
- Order history and user profile pages
- Admin dashboard for managing products
- REST API with search, filtering, sorting, and pagination for products

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Tailwind CSS
- Zustand
- Axios

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn
- SQLite for development

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- pip

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at http://localhost:5173.

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The API will run at http://127.0.0.1:8000 and the documentation at http://127.0.0.1:8000/docs.

## API Notes

The backend exposes endpoints under `/api` for:
- Products
- Orders
- Profile management

## Development Notes

- The backend creates database tables automatically on startup for local development.
- The app is designed to be extended with PostgreSQL or Supabase production settings in the future.

## License

This project is intended for educational and portfolio demonstration purposes.
