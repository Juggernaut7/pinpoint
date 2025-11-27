# PINPOINT Integration Status 🚀

## ✅ Completed

### 1. **Frontend UI** ✓
- Mobile-first, responsive design
- All pages scaffolded (home, practice, reward, play, leaderboard, results, wallet, how-it-works)
- Consistent design system with Celo/MiniPay colors

### 2. **Wallet Integration** ✓
- RainbowKit + Wagmi setup
- Supports MetaMask, Rabby, MiniPay, WalletConnect
- Auto-connect for MiniPay
- Celo Mainnet, Alfajores, Sepolia support

### 3. **Backend API** ✓
- MongoDB Atlas connected
- All API routes implemented:
  - `GET/POST /api/rounds` - Create/list rounds
  - `POST /api/rounds/:id/join` - Join round with entry fee
  - `POST /api/rounds/:id/submit` - Submit scores
  - `GET /api/leaderboard` - Get leaderboards (round/daily/weekly)
  - `POST /api/payouts/:roundId` - Trigger payouts
  - `GET /api/health` - Health check

### 4. **Game Flow Integration** ✓
- **Practice Mode**: Free play, no submission
- **Reward Mode**: 
  - Create/join rounds
  - Submit scores to API
  - Signature generation for anti-cheat
  - Real-time pool tracking

### 5. **Leaderboard** ✓
- Connected to API
- Shows round/daily/weekly leaderboards
- Real-time updates

## 🚧 In Progress

### 6. **MiniPay Entry Fee Payment** (Next Priority)
- [ ] Detect MiniPay wallet
- [ ] Request cUSD transfer for entry fee
- [ ] Verify transaction on-chain
- [ ] Update join round flow to use real payment

## 📋 Remaining Tasks

### 7. **MiniPay Payout System**
- [ ] Complete `verifyEntryFeePayment()` in `/lib/minipay.ts`
- [ ] Complete `sendPayout()` in `/lib/minipay.ts`
- [ ] Wire payout endpoint to send cUSD to winners
- [ ] Add cron job or manual trigger

### 8. **Signature Verification**
- [ ] Backend: Verify signatures in `/api/rounds/:id/submit`
- [ ] Reject invalid signatures

### 9. **IPFS Integration** (Optional)
- [ ] Upload game replays to Web3.Storage
- [ ] Store CIDs in score records

## 🎮 Current Game Flow

### Practice Mode
1. User clicks "Practice Mode" → `/practice`
2. Clicks "Start Practice" → `/play?mode=practice`
3. Plays 5 taps → Gets score
4. Score saved locally (no API submission)

### Reward Mode
1. User clicks "Reward Mode" → `/reward`
2. Sees live pool and player count
3. Clicks "Enter & play" → Creates/joins round
4. **TODO**: Pay entry fee via MiniPay
5. Redirects to `/play?mode=reward&roundId=...`
6. Plays 5 taps → Gets score
7. Auto-submits to API with signature
8. Score appears on leaderboard

## 🧪 Testing

### Test API Endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# List rounds
curl http://localhost:3000/api/rounds

# Create round
curl -X POST http://localhost:3000/api/rounds \
  -H "Content-Type: application/json" \
  -d '{"entryFee": 0.01, "duration": 3600000}'

# Get leaderboard
curl http://localhost:3000/api/leaderboard?scope=daily
```

### Test Game Flow
1. Visit `http://localhost:3000`
2. Click "Practice Mode" → Play → Verify score saved locally
3. Click "Reward Mode" → Connect wallet → Join round → Play → Verify score submitted

## 🔑 Environment Variables

All set in `apps/web/.env`:
- ✅ `MONGODB_URI` - Connected
- ✅ `NEXT_PUBLIC_WC_PROJECT_ID` - Set
- ✅ `MINIPAY_ISSUER_PRIVATE_KEY` - Set
- ✅ `MINIPAY_ISSUER_ADDRESS` - Set

## 📝 Next Steps (Priority Order)

1. **MiniPay Entry Fee** - Most critical for demo
2. **Payout System** - Core feature
3. **Signature Verification** - Security
4. **IPFS** - Nice to have

## 🎯 Hackathon Ready Checklist

- [x] Playable game
- [x] Backend API working
- [x] Leaderboard functional
- [ ] Entry fee payment (MiniPay)
- [ ] Payout system (MiniPay)
- [ ] Demo video script
- [ ] README with setup instructions

