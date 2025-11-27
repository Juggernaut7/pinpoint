# PINPOINT API Routes

This directory contains all API routes for the PINPOINT backend.

## API Endpoints

### Rounds

#### `GET /api/rounds`
Get all active rounds.

**Response:**
```json
{
  "rounds": [
    {
      "_id": "round_id",
      "status": "open",
      "entryFee": 0.01,
      "pool": 1.25,
      "players": ["0x..."],
      ...
    }
  ]
}
```

#### `POST /api/rounds`
Create a new round.

**Request Body:**
```json
{
  "entryFee": 0.01,
  "duration": 3600000  // in milliseconds
}
```

#### `POST /api/rounds/:id/join`
Join a round (validate entry fee payment).

**Request Body:**
```json
{
  "userAddress": "0x...",
  "txHash": "0x..."  // Entry fee transaction hash
}
```

#### `POST /api/rounds/:id/submit`
Submit score for a round.

**Request Body:**
```json
{
  "userAddress": "0x...",
  "score": 120,  // Average reaction time in ms
  "taps": [120, 130, 110, 100, 120],
  "proofSignature": "0x..."  // Signed message proof
}
```

### Leaderboard

#### `GET /api/leaderboard`
Get leaderboard data.

**Query Parameters:**
- `scope`: `round` | `daily` | `weekly` (default: `round`)
- `roundId`: Round ID (required if scope is `round`)

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user": "0xF3…74b7",
      "score": 128,
      "timestamp": "2025-01-01T12:00:00Z"
    }
  ],
  "scope": "round"
}
```

### Payouts

#### `POST /api/payouts/:roundId`
Trigger payout for a round (admin/cron endpoint).

**Response:**
```json
{
  "message": "Payouts calculated",
  "payouts": [...],
  "totalAmount": 1.1875
}
```

## Database Collections

- `rounds` - Round metadata and pool information
- `scores` - Player scores and reaction times
- `payouts` - Payout records and transaction hashes

## Environment Variables

See `.env.example` for all required environment variables.

## Next Steps

1. Install dependencies: `pnpm install`
2. Copy `.env.example` to `.env.local` and fill in values
3. Set up MongoDB Atlas and get connection string
4. Implement MiniPay SDK integration for payouts
5. Add transaction verification for entry fees

