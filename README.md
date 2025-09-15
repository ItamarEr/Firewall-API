# Firewall Management System

This repository contains a full-stack application for managing firewall rules, including a Node.js/Express REST API backend and a Next.js frontend dashboard. The backend uses PostgreSQL for data storage.

## Project Structure

- **backend/** — Node.js + Express REST API for firewall rule management
- **frontend/** — Next.js dashboard for interacting with the API

## Features

- Add, remove, update, and retrieve firewall rules (IP, URL, port)
- Blacklist and whitelist support
- PostgreSQL database integration
- Modern dashboard UI (Next.js)

## Getting Started

### Backend Setup

1. Navigate to the `backend` directory:
	```sh
	cd backend
	```
2. Install dependencies:
	```sh
	pnpm install
	```
3. Copy `.env.example` to `.env` and fill in your database credentials.
4. Start the backend server:
	```sh
	pnpm start
	```

### Frontend Setup

1. Navigate to the `frontend` directory:
	```sh
	cd ../frontend
	```
2. Install dependencies:
	```sh
	pnpm install
	```
3. Copy `.env` if needed and set the API server URL.
4. Start the frontend development server:
	```sh
	pnpm dev
	```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Overview

The backend exposes endpoints under `/api/firewall` for managing rules. See `backend/README.md` for full API documentation.

## Environment Variables

- See `backend/.env.example` and `frontend/.env` for required variables.
