# PINPOINT - Project Summary & Implementation Status

## 🎯 Project Overview

**PINPOINT** is a mobile-first, Play-to-Earn (P2E) reaction game built on Celo with MiniPay integration. Players compete in timed reaction challenges, pay entry fees, and earn rewards based on their performance.

## ✅ What We've Built

### 1. **Frontend (React/Next.js)**
- ✅ Mobile-first, responsive UI (works on all screen sizes)
- ✅ Practice Mode (free, no payments)
- ✅ Reward Mode (paid entry, real rewards)
- ✅ Game page with 5-tap reaction timer
- ✅ Leaderboard (round/daily/weekly views)
- ✅ Wallet connection (MetaMask, Rabby, MiniPay, WalletConnect)
- ✅ Real-time pool tracking
- ✅ Score submission with signature generation

### 2. **Backend API (Next.js API Routes)**
- ✅ `GET /api/rounds` - List active rounds
- ✅ `POST /api/rounds` - Create new round
- ✅ `POST /api/rounds/:id/join` - Join round with entry fee
- ✅ `POST /api/rounds/:id/submit` - Submit game score
- ✅ `GET /api/leaderboard` - Get leaderboards (round/daily/weekly)
- ✅ `POST /api/payouts/:roundId` - Calculate and trigger payouts
- ✅ `GET /api/health` - Health check & MongoDB connection test

### 3. **Database (MongoDB Atlas)**
- ✅ Connection setup with connection pooling
- ✅ Collections:
  - `rounds` - Round metadata, pool, players
  - `scores` - Player scores and reaction times
  - `payouts` - Payout records and transaction hashes
- ✅ Zod schema validation for all data

### 4. **Wallet Integration**
- ✅ RainbowKit + Wagmi setup
- ✅ Multi-wallet support (MetaMask, Rabby, MiniPay, WalletConnect)
- ✅ Celo networks (Mainnet, Alfajores, Sepolia)
- ✅ Auto-connect for MiniPay
- ✅ Balance display (CELO, cUSD, USDC, USDT)

### 5. **Payment Flow**
- ✅ Entry fee payment via cUSD transfer
- ✅ Transaction confirmation waiting
- ✅ Mock cUSD token support (for testing)
- ✅ Payment status tracking

### 6. **Game Mechanics**
- ✅ 5-tap reaction timer
- ✅ Average reaction time calculation
- ✅ Score submission to API
- ✅ Signature generation for anti-cheat
- ✅ Duplicate join prevention
- ✅ Button state management (prevents accidental restarts)

### 7. **Leaderboard System**
- ✅ Round-specific leaderboards
- ✅ Daily leaderboards
- ✅ Weekly leaderboards
- ✅ Auto-refresh every 5 seconds
- ✅ Real-time updates on score submission

### 8. **Payout System**
- ✅ Payout calculation (ranked distribution)
- ✅ House fee deduction (5%)
- ✅ Top 10 winners selection
- ✅ Payout record creation
- ⚠️ **TODO**: MiniPay SDK integration for actual transfers

## 📋 Technical Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Wallet**: RainbowKit, Wagmi, Viem
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Blockchain**: Celo (Mainnet, Alfajores, Sepolia)
- **Tokens**: cUSD (Celo Dollar)
- **Validation**: Zod

## 🔧 Configuration

### Environment Variables
```bash
# Wallet
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_MINIPAY_ISSUER_ADDRESS=your_issuer_address

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pinpoint

# MiniPay
MINIPAY_ISSUER_PRIVATE_KEY=your_private_key
MINIPAY_ISSUER_ADDRESS=your_issuer_address

# Game Config
ENTRY_FEE=0.01
HOUSE_FEE_PERCENT=5
TOP_WINNERS_COUNT=10

# Custom cUSD (for testing)
NEXT_PUBLIC_CUSD_ADDRESS=0x6c23508A9b310C5f2eb2e2eFeBeB748067478667
```

## 🎮 User Flow

### Practice Mode
1. User → Practice page → Start Practice
2. Play 5 taps → Get score
3. Score saved locally (no API submission)

### Reward Mode
1. User → Reward page → Connect wallet
2. Click "Enter & play" → Pay 0.01 cUSD entry fee
3. Round created/joined → Redirect to play page
4. Play 5 taps → Score auto-submitted
5. View leaderboard → See ranking

### Payout Flow (Admin)
1. Round closes (after 1 hour)
2. Admin triggers `POST /api/payouts/:roundId`
3. System calculates winners
4. Payout records created
5. **TODO**: MiniPay transfers executed

## 🚧 Remaining Tasks

### High Priority
1. **MiniPay Payout Integration**
   - Complete `sendPayout()` in `/lib/minipay.ts`
   - Wire payout endpoint to send cUSD
   - Store transaction hashes

2. **On-Chain Verification**
   - Verify entry fee transactions
   - Check transaction amount matches entry fee
   - Verify transaction is confirmed

3. **Signature Verification**
   - Backend verification of score signatures
   - Reject invalid signatures

### Medium Priority
4. **Automatic Round Management**
   - Auto-close rounds at `closeAt` time
   - Auto-create new rounds
   - Cron job for payouts

5. **IPFS Integration** (Optional)
   - Upload game replays
   - Store proof-of-gameplay

## 📊 Current Round System

### Round Creation
- **Automatic**: Created when user joins and no active round exists
- **Duration**: 1 hour (default, configurable)
- **Entry Fee**: 0.01 cUSD (configurable)

### Round States
- `open`: Accepting players and scores
- `closed`: No new players, scores still accepted
- `paid`: Payouts completed

### Payout Distribution
- **House Fee**: 5% of pool
- **Top 10 Winners**: Ranked distribution
  - 1st: 30%
  - 2nd: 20%
  - 3rd: 15%
  - 4th: 10%
  - 5th: 8%
  - 6th: 6%
  - 7th: 5%
  - 8th: 3%
  - 9th: 2%
  - 10th: 1%

## 🐛 Known Issues & Fixes

### Fixed
- ✅ MongoDB connection timeout (URI format)
- ✅ Schema validation errors (roundId in body)
- ✅ Signature validation (empty string handling)
- ✅ Button state management (prevent restarts)
- ✅ Leaderboard refresh (auto-update)
- ✅ Duplicate join handling

### Pending
- ⚠️ Transaction timeout on slow RPC (increased timeout to 60s)
- ⚠️ Payout execution (needs MiniPay SDK)

## 📝 Files Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── rounds/
│   │   │   │   ├── route.ts (list/create)
│   │   │   │   └── [id]/
│   │   │   │       ├── join/route.ts
│   │   │   │       └── submit/route.ts
│   │   │   ├── leaderboard/route.ts
│   │   │   ├── payouts/[roundId]/route.ts
│   │   │   └── health/route.ts
│   │   ├── play/page.tsx (game)
│   │   ├── reward/page.tsx (reward mode)
│   │   ├── practice/page.tsx (practice mode)
│   │   └── leaderboard/page.tsx
│   ├── components/
│   │   ├── wallet-provider.tsx
│   │   └── connect-button.tsx
│   └── lib/
│       ├── mongodb.ts
│       ├── models.ts (Zod schemas)
│       └── minipay.ts (TODO: payout functions)
```

## 🎯 Next Steps

1. **Complete MiniPay Integration** - Execute payouts
2. **Add Cron Jobs** - Auto-close rounds and trigger payouts
3. **On-Chain Verification** - Verify entry fee payments
4. **Signature Verification** - Backend validation
5. **Testing** - End-to-end testing with real transactions
6. **Demo Video** - Record gameplay and payout flow

