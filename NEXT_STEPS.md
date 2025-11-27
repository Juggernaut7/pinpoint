# PINPOINT - Next Steps

## ✅ What's Done

1. **Frontend UI** - Mobile-first, responsive design
2. **Wallet Integration** - RainbowKit with MetaMask, Rabby, MiniPay support
3. **API Routes** - All endpoints scaffolded:
   - `/api/rounds` - Create/list rounds
   - `/api/rounds/:id/join` - Join round with entry fee
   - `/api/rounds/:id/submit` - Submit scores
   - `/api/leaderboard` - Get leaderboards (round/daily/weekly)
   - `/api/payouts/:roundId` - Trigger payouts
4. **Database Models** - Zod schemas for validation
5. **Leaderboard Page** - Connected to API

## 🔧 Current Issue: MongoDB Connection

**Status**: Connection timing out

**To Fix**:
1. Go to https://cloud.mongodb.com
2. Check if cluster is **paused** → Click **Resume**
3. Go to **Network Access** → Add IP `0.0.0.0/0` (for testing)
4. Verify connection string in `.env` matches your cluster

**Test**: Visit `http://localhost:3000/api/health` to check connection

## 🚀 Next Steps (Priority Order)

### 1. Wire Game Page to API (High Priority)
- [ ] Update `/app/play/page.tsx` to submit scores to `/api/rounds/:id/submit`
- [ ] Add signature generation for anti-cheat
- [ ] Show real-time leaderboard after submission

### 2. Implement Entry Fee Payment (High Priority)
- [ ] Update `/app/reward/page.tsx` to:
  - Detect MiniPay wallet
  - Request cUSD transfer for entry fee (0.01 cUSD)
  - Call `/api/rounds/:id/join` with transaction hash
- [ ] Verify payment on backend before allowing play

### 3. Implement Payout System (Medium Priority)
- [ ] Complete `/lib/minipay.ts` functions:
  - `verifyEntryFeePayment()` - Check on-chain transaction
  - `sendPayout()` - Transfer cUSD to winners
- [ ] Wire `/api/payouts/:roundId` to calculate and send payouts
- [ ] Add cron job or manual trigger for payouts

### 4. Add Signature Verification (Medium Priority)
- [ ] Client: Sign message with wallet (roundId + score + timestamp)
- [ ] Backend: Verify signature matches userAddress
- [ ] Reject invalid signatures

### 5. IPFS Integration (Low Priority - Optional)
- [ ] Upload game replay screenshots to Web3.Storage
- [ ] Store CID in score records
- [ ] Display proof links on leaderboard

## 📝 Environment Variables Checklist

Make sure these are in `apps/web/.env`:

```bash
# ✅ MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/pinpoint

# ✅ WalletConnect
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id

# ✅ MiniPay
MINIPAY_ISSUER_PRIVATE_KEY=your_private_key
MINIPAY_ISSUER_ADDRESS=your_address

# ✅ Game Config
ENTRY_FEE=0.01
HOUSE_FEE_PERCENT=5
TOP_WINNERS_COUNT=10
```

## 🎮 Game Flow (Once MongoDB is Connected)

1. **Practice Mode** (Free)
   - Play 5 taps → Get score → No submission

2. **Reward Mode** (Paid)
   - Click "Join Round" → Pay 0.01 cUSD entry fee
   - Play 5 taps → Get score
   - Submit score → Added to leaderboard
   - When round closes → Top 10 get payouts

## 🧪 Testing

1. **Test API**: `curl http://localhost:3000/api/health`
2. **Test Rounds**: `curl http://localhost:3000/api/rounds`
3. **Test Leaderboard**: Visit `http://localhost:3000/leaderboard`

## 📚 Resources

- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [MiniPay Docs](https://docs.celo.org/developer/minipay)
- [RainbowKit Docs](https://www.rainbowkit.com/docs/introduction)

