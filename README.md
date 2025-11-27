# PINPOINT

A mobile-first, Play-to-Earn (P2E) reaction game built on Celo with MiniPay integration. Players compete in timed reaction challenges, pay entry fees, and earn rewards based on their performance.

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Next.js    │  │  RainbowKit  │  │   Wagmi      │        │
│  │   React      │  │  Wallet UI   │  │  Blockchain  │        │
│  │  TypeScript  │  │              │  │  Integration │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   /rounds   │  │ /leaderboard │  │  /payouts    │        │
│  │   /join     │  │              │  │              │        │
│  │  /submit    │  │              │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ MongoDB Driver
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer (MongoDB)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    rounds    │  │    scores    │  │   payouts    │      │
│  │  Collection  │  │  Collection   │  │  Collection  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ MiniPay SDK
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Blockchain Layer (Celo)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   cUSD       │  │   MiniPay    │  │   Celo      │        │
│  │   Transfers  │  │   Wallet     │  │   Network    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- RainbowKit + Wagmi (Wallet Integration)
- Viem (Blockchain Utilities)

**Backend:**
- Next.js API Routes (Serverless Functions)
- MongoDB Atlas (Database)
- Zod (Schema Validation)

**Blockchain:**
- Celo Network (Mainnet, Alfajores, Sepolia)
- cUSD Token (Celo Dollar)
- MiniPay SDK (Mobile Wallet)

## 🔄 System Flow

### Round Lifecycle Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Round Creation Flow                        │
└──────────────────────────────────────────────────────────────┘

User clicks "Enter & play"
         │
         ▼
┌────────────────────┐
│ Check active round │
└────────────────────┘
         │
    ┌────┴────┐
    │         │
   Yes       No
    │         │
    │         ▼
    │    ┌──────────────┐
    │    │ Create Round  │
    │    │ - 1 hour      │
    │    │ - Entry: 1cUSD│
    │    └──────────────┘
    │         │
    └─────────┘
         │
         ▼
┌────────────────────┐
│ Request Payment    │
│ (1 cUSD via cUSD)  │
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ User Approves      │
│ Transaction        │
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Join Round API     │
│ - Add to players[] │
│ - Update pool      │
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Redirect to /game  │
└────────────────────┘
```

### Gameplay Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      Gameplay Flow                            │
└──────────────────────────────────────────────────────────────┘

Start Round
    │
    ▼
┌──────────────┐
│ Wait 2-5s    │  (Random delay)
└──────────────┘
    │
    ▼
┌──────────────┐
│ Show Target  │  (Visual indicator)
└──────────────┘
    │
    ▼
┌──────────────┐
│ User Taps    │  (Measure reaction time)
└──────────────┘
    │
    ▼
┌──────────────┐
│ Record Time  │  (performance.now())
└──────────────┘
    │
    ▼
┌──────────────┐
│ Repeat 5x    │  (5 taps total)
└──────────────┘
    │
    ▼
┌──────────────┐
│ Calculate    │  (Average reaction time)
│ Score        │
└──────────────┘
    │
    ▼
┌──────────────┐
│ Submit Score │  (Auto-submit in reward mode)
│ + Signature  │
└──────────────┘
    │
    ▼
┌──────────────┐
│ Update       │
│ Leaderboard  │
└──────────────┘
```

### Payout Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      Payout Flow                              │
└──────────────────────────────────────────────────────────────┘

Round closes (after 1 hour)
    │
    ▼
┌────────────────────┐
│ Trigger Payout API │  (Manual or Cron)
└────────────────────┘
    │
    ▼
┌────────────────────┐
│ Fetch All Scores   │
│ for Round          │
└────────────────────┘
    │
    ▼
┌────────────────────┐
│ Sort by Score      │  (Lower = Better)
│ (Ascending)        │
└────────────────────┘
    │
    ▼
┌────────────────────┐
│ Calculate Top 10%  │  (Minimum 1 winner)
│ Winners            │
└────────────────────┘
    │
    ▼
┌────────────────────┐
│ Apply Distribution │
│ [20%, 15%, 12%,    │
│  10%, 8%, 7%, 6%,  │
│  5%, 4%, 3%, ...]  │
└────────────────────┘
    │
    ▼
┌────────────────────┐
│ Deduct House Fee   │  (5% of pool)
└────────────────────┘
    │
    ▼
┌────────────────────┐
│ Create Payout      │
│ Records            │
└────────────────────┘
    │
    ▼
┌────────────────────┐
│ Execute MiniPay     │  (TODO: Implement)
│ Transfers          │
└────────────────────┘
    │
    ▼
┌────────────────────┐
│ Update Round       │
│ Status: "paid"     │
└────────────────────┘
```

## 📊 Database Schema

### Collections

#### `rounds`
```typescript
{
  _id: ObjectId,
  status: "open" | "closed" | "paid",
  createdAt: Date,
  closeAt: Date,
  entryFee: number,        // 1 cUSD
  pool: number,            // Total entry fees collected
  players: string[],       // Array of wallet addresses
  payoutConfig: {
    topN: number,          // Not used (top 10% instead)
    distribution: "top10percent"
  }
}
```

#### `scores`
```typescript
{
  _id: ObjectId,
  roundId: string,
  userAddress: string,     // 0x...
  score: number,           // Average reaction time (ms)
  taps: number[],          // [120, 130, 110, 100, 120]
  submittedAt: Date,
  proofSignature: string,  // Signed message (EIP-191)
  claimed: boolean,
  ipfsCid?: string         // Optional: IPFS proof
}
```

#### `payouts`
```typescript
{
  _id: ObjectId,
  roundId: string,
  recipient: string,       // 0x...
  amount: number,          // cUSD amount
  txHash?: string,         // MiniPay transaction hash
  status: "pending" | "sent" | "failed",
  createdAt: Date
}
```

## 🔌 API Endpoints

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
      "createdAt": "2025-01-01T12:00:00Z",
      "closeAt": "2025-01-01T13:00:00Z",
      "entryFee": 1,
      "pool": 5.00,
      "players": ["0x..."],
      "payoutConfig": {
        "topN": 0,
        "distribution": "top10percent"
      }
    }
  ]
}
```

#### `POST /api/rounds`
Create a new round.

**Request:**
```json
{
  "entryFee": 1,
  "duration": 3600000
}
```

**Response:**
```json
{
  "roundId": "round_id",
  "status": "open",
  "closeAt": "2025-01-01T13:00:00Z",
  ...
}
```

#### `POST /api/rounds/:id/join`
Join a round (after payment).

**Request:**
```json
{
  "userAddress": "0x...",
  "txHash": "0x..."
}
```

**Response:**
```json
{
  "message": "Successfully joined round",
  "roundId": "round_id"
}
```

#### `POST /api/rounds/:id/submit`
Submit game score.

**Request:**
```json
{
  "userAddress": "0x...",
  "score": 120,
  "taps": [120, 130, 110, 100, 120],
  "proofSignature": "0x..."
}
```

**Response:**
```json
{
  "message": "Score submitted successfully",
  "score": { ... }
}
```

#### `POST /api/rounds/close`
Auto-close expired rounds (cron endpoint).

**Response:**
```json
{
  "message": "Closed 2 round(s)",
  "closed": 2,
  "roundIds": ["id1", "id2"]
}
```

### Leaderboard

#### `GET /api/leaderboard`
Get leaderboard data.

**Query Parameters:**
- `scope`: `round` | `daily` | `weekly`
- `roundId`: Required if `scope=round`

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user": "0xF3…74b7",
      "score": 120,
      "time": "2 min ago",
      "timestamp": "2025-01-01T12:00:00Z"
    }
  ],
  "scope": "round"
}
```

### Payouts

#### `POST /api/payouts/:roundId`
Trigger payout calculation and execution.

**Response:**
```json
{
  "message": "Payouts calculated",
  "payouts": [
    {
      "roundId": "round_id",
      "recipient": "0x...",
      "amount": 0.95,
      "status": "pending"
    }
  ],
  "totalAmount": 9.5
}
```

### Health

#### `GET /api/health`
Check system health and MongoDB connection.

**Response:**
```json
{
  "status": "healthy",
  "checks": {
    "mongodb_connection": "CONNECTED",
    "mongodb_uri": "mongodb+srv://***:***@...",
    "collections": ["rounds", "scores", "payouts"],
    "document_counts": {
      "rounds": 5,
      "scores": 42,
      "payouts": 10
    }
  }
}
```

## 🎮 Game Mechanics

### Round System

- **Entry Fee**: 1 cUSD per player
- **Duration**: 1 hour (default, configurable)
- **Auto-Creation**: Rounds created automatically when first player joins
- **Auto-Close**: Rounds close automatically at `closeAt` time
- **Status Flow**: `open` → `closed` → `paid`

### Scoring

- **Game Format**: 5 taps per round
- **Measurement**: Reaction time in milliseconds (lower is better)
- **Score Calculation**: Average of 5 tap reaction times
- **Validation**: Signature-based proof (EIP-191)

### Payout System

- **House Fee**: 5% of total pool
- **Winners**: Top 10% of players (minimum 1)
- **Distribution**: Ranked percentages
  - 1st: 20%
  - 2nd: 15%
  - 3rd: 12%
  - 4th: 10%
  - 5th: 8%
  - 6th: 7%
  - 7th: 6%
  - 8th: 5%
  - 9th: 4%
  - 10th: 3%
  - Remaining winners: Equal shares

**Example:**
- 100 players → 10 winners
- Pool: 100 cUSD
- House fee: 5 cUSD
- Distributable: 95 cUSD
- 1st place: 19 cUSD (20% of 95)
- 2nd place: 14.25 cUSD (15% of 95)
- ...

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- MongoDB Atlas account
- WalletConnect Project ID
- Celo wallet (for testing)

### Installation

   ```bash
# Clone repository
git clone https://github.com/Juggernaut7/pinpoint.git
cd pinpoint

# Install dependencies
   pnpm install

# Copy environment template
cp apps/web/src/app/api/.example apps/web/.env.local
```

### Environment Variables

Create `apps/web/.env.local`:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pinpoint?retryWrites=true&w=majority

# WalletConnect
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id

# MiniPay
MINIPAY_ISSUER_PRIVATE_KEY=your_private_key
MINIPAY_ISSUER_ADDRESS=0x...
NEXT_PUBLIC_MINIPAY_ISSUER_ADDRESS=0x...

# Game Configuration
ENTRY_FEE=1
HOUSE_FEE_PERCENT=5
TOP_WINNERS_COUNT=10

# Optional: Custom cUSD (for testing)
NEXT_PUBLIC_CUSD_ADDRESS=0x6c23508A9b310C5f2eb2e2eFeBeB748067478667
```

### Development

   ```bash
# Start development server
   pnpm dev

# Build for production
pnpm build

# Type check
pnpm type-check

# Lint
pnpm lint
```

### MongoDB Setup

1. Create MongoDB Atlas cluster
2. Get connection string
3. Add IP whitelist: `0.0.0.0/0` (for development)
4. Update `MONGODB_URI` in `.env.local`

### Testing

```bash
# Test API health
curl http://localhost:3000/api/health

# Test rounds endpoint
curl http://localhost:3000/api/rounds

# Test leaderboard
curl http://localhost:3000/api/leaderboard?scope=daily
```

## 📱 Frontend Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/practice` | Practice mode (free) |
| `/reward` | Reward mode (paid entry) |
| `/game` | Game screen |
| `/result` | Results page |
| `/leaderboard` | Leaderboards (round/daily/weekly) |
| `/wallet` | Wallet connection |
| `/how-it-works` | How it works page |

## 🔐 Security

### Anti-Cheat Measures

1. **Signature Verification**: Scores signed with wallet (EIP-191)
2. **Duplicate Prevention**: Users cannot join same round twice
3. **Transaction Verification**: Entry fee transactions verified (TODO)
4. **Rate Limiting**: Per-wallet/IP submission limits (TODO)

### Best Practices

- Never expose private keys in client code
- Validate all API inputs with Zod schemas
- Use environment variables for sensitive data
- Verify blockchain transactions server-side

## 🚢 Deployment

### Vercel Deployment

See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for detailed deployment instructions.

**Quick Steps:**
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Required Vercel Environment Variables:**
- `MONGODB_URI`
- `NEXT_PUBLIC_WC_PROJECT_ID`
- `MINIPAY_ISSUER_PRIVATE_KEY`
- `MINIPAY_ISSUER_ADDRESS`
- `NEXT_PUBLIC_MINIPAY_ISSUER_ADDRESS`

### MongoDB Atlas Configuration

- **Network Access**: Add `0.0.0.0/0` for Vercel serverless functions
- **Database**: `pinpoint`
- **Collections**: Auto-created on first use

## 📁 Project Structure

```
pinpoint/
├── apps/
│   ├── web/                    # Next.js application
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   │   ├── api/        # API routes
│   │   │   │   ├── game/       # Game page
│   │   │   │   ├── reward/     # Reward mode
│   │   │   │   └── ...
│   │   │   ├── components/     # React components
│   │   │   └── lib/            # Utilities
│   │   │       ├── mongodb.ts  # DB connection
│   │   │       ├── models.ts    # Zod schemas
│   │   │       └── minipay.ts   # MiniPay SDK
│   │   └── package.json
│   └── contracts/              # Hardhat contracts
├── package.json                # Root package.json
└── turbo.json                  # Turborepo config
```

## 🛠️ Development Scripts

```bash
# Development
pnpm dev              # Start dev server

# Build
pnpm build            # Build all packages
pnpm type-check       # TypeScript check
pnpm lint             # Lint code

# Contracts
pnpm contracts:compile
pnpm contracts:test
pnpm contracts:deploy:alfajores
```

## 📚 Additional Documentation

- [API Documentation](./apps/web/src/app/api/README.md)
- [Vercel Setup Guide](./VERCEL_SETUP.md)
- [Contracts Documentation](./apps/contracts/README.md)

## 🔄 Roadmap

- [ ] MiniPay SDK payout integration
- [ ] On-chain transaction verification
- [ ] Signature verification backend
- [ ] Cron job for auto-payouts
- [ ] IPFS proof storage
- [ ] Rate limiting
- [ ] Admin dashboard

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.
