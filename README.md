# Firewall API Backend

A Node.js and Express REST API for managing firewall rules (IP, URL, and port blacklists/whitelists) with PostgreSQL backend.

## Features
- Add, remove, update, and retrieve firewall rules
- Supports IP, URL, and port rules
- Blacklist and whitelist modes
- PostgreSQL database integration

## Setup

1. Clone the repository and navigate to the `backend` directory.
2. Install dependencies:
   ```sh
   pnpm install
   ```
3. Copy `.env.example` to `.env` and fill in your database credentials.
4. Start the server:
   ```sh
   pnpm start
   ```

## API Endpoints

Base URL: `/api/firewall`

- `POST /ip` — Add IP rules
- `DELETE /ip` — Remove IP rules
- `POST /url` — Add URL rules
- `DELETE /url` — Remove URL rules
- `POST /port` — Add port rules
- `DELETE /port` — Remove port rules
- `GET /rules` — Get all rules
- `PUT /rules` — Update rule status (active = true/false)

## Environment Variables
See `.env.example` for required variables:
```
PGUSER=your_db_user
PGHOST=localhost
PGDATABASE=your_db_name
PGPASSWORD=your_db_password
PGPORT=5432
```
