# Luminex Backend

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

- The server runs on `http://localhost:5001` by default.
- Health check: `GET /health`
- MongoDB, JWT, and BullMQ (Redis) are ready for integration.
