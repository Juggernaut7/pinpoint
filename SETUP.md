# PINPOINT Setup Guide

## Quick Start Checklist

### ✅ Already Done
- [x] Frontend UI scaffolded
- [x] Wallet connection (RainbowKit)
- [x] API routes created
- [x] Game logic implemented

### 🔧 What's Needed Now

#### 1. MongoDB Setup (Required for API)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster (M0 - Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Add to `apps/web/.env.local`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pinpoint?retryWrites=true&w=majority
   ```
7. Replace `username` and `password` with your database user credentials

#### 2. WalletConnect Project ID (Required for wallet connection)
1. Go to https://cloud.walletconnect.com
2. Create a new project
3. Copy the Project ID
4. Add to `apps/web/.env.local`:
   ```
   NEXT_PUBLIC_WC_PROJECT_ID=your_project_id_here
   ```

#### 3. Test API Connection
After adding MongoDB URI, test:
```bash
curl http://localhost:3000/api/rounds
```
Should return: `{"rounds":[]}` (empty array is fine - means it's connected!)

### 🚀 Next Steps (After MongoDB is connected)

1. **Wire Frontend to APIs**
   - Connect game page to submit scores
   - Connect leaderboard to fetch real data
   - Connect reward mode to create/join rounds

2. **Implement Entry Fee Flow**
   - Detect when user wants to join reward round
   - Request cUSD transfer via MiniPay/wallet
   - Verify transaction on backend
   - Add player to round

3. **Implement Payout System**
   - Calculate winners after round closes
   - Use MiniPay SDK to send payouts
   - Store transaction hashes

### 📝 Optional (For Later)

- Smart contracts (only if you want fully decentralized escrow)
- IPFS for game replays
- Signature verification for anti-cheat

## Architecture Decision

**Current Approach: Backend + MiniPay SDK**
- ✅ Faster to build
- ✅ Lower gas costs (only for transfers)
- ✅ Easier to update game logic
- ✅ Works great for hackathon demo

**Alternative: Smart Contracts**
- More decentralized
- Higher gas costs
- Slower to iterate
- Better for production long-term

For hackathon: **Backend + MiniPay SDK is perfect!**

