# Vercel Deployment Setup Guide

## 🔧 Required Environment Variables

You **must** add these environment variables in your Vercel project settings for the API to work.

### How to Add Environment Variables in Vercel:

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable below:

### Required Variables:

```bash
# MongoDB Connection (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pinpoint?retryWrites=true&w=majority

# WalletConnect (REQUIRED)
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id

# MiniPay Configuration (REQUIRED)
MINIPAY_ISSUER_PRIVATE_KEY=your_private_key_here
MINIPAY_ISSUER_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_MINIPAY_ISSUER_ADDRESS=0x1234567890123456789012345678901234567890

# Game Configuration (Optional - defaults provided)
ENTRY_FEE=1
HOUSE_FEE_PERCENT=5
TOP_WINNERS_COUNT=10

# Custom cUSD Address (Optional - for testing)
NEXT_PUBLIC_CUSD_ADDRESS=0x6c23508A9b310C5f2eb2e2eFeBeB748067478667
```

### Important Notes:

1. **MongoDB Atlas IP Whitelist**: 
   - Go to MongoDB Atlas → Network Access
   - Add `0.0.0.0/0` to allow all IPs (or Vercel's IP ranges)
   - This is required for Vercel serverless functions to connect

2. **Environment Scope**:
   - Set variables for **Production**, **Preview**, and **Development** environments
   - Or at minimum, set for **Production**

3. **After Adding Variables**:
   - **Redeploy** your project (Vercel will auto-redeploy on next push, or manually trigger)
   - Environment variables are only available after redeployment

## 🧪 Testing After Setup

1. Visit: `https://your-app.vercel.app/api/health`
   - Should show `"status": "healthy"` and `"mongodb_connection": "CONNECTED"`

2. Visit: `https://your-app.vercel.app/api/rounds`
   - Should return `{ "rounds": [] }` (empty if no rounds exist)

3. Visit: `https://your-app.vercel.app/leaderboard`
   - Should load without errors

## 🐛 Troubleshooting

### "Failed to load leaderboard"
- **Cause**: MongoDB not connected
- **Fix**: 
  1. Check `MONGODB_URI` is set in Vercel
  2. Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
  3. Verify URI format: `mongodb+srv://user:pass@cluster.mongodb.net/pinpoint?retryWrites=true&w=majority`

### "Please add your Mongo URI"
- **Cause**: `MONGODB_URI` environment variable not set
- **Fix**: Add `MONGODB_URI` in Vercel environment variables

### API Routes Return 500
- **Cause**: MongoDB connection failed
- **Fix**: 
  1. Check MongoDB Atlas cluster is running (not paused)
  2. Check network access allows all IPs
  3. Verify credentials in URI are correct

## 📝 Quick Checklist

- [ ] `MONGODB_URI` added to Vercel
- [ ] `NEXT_PUBLIC_WC_PROJECT_ID` added to Vercel
- [ ] `MINIPAY_ISSUER_PRIVATE_KEY` added to Vercel
- [ ] `MINIPAY_ISSUER_ADDRESS` added to Vercel
- [ ] `NEXT_PUBLIC_MINIPAY_ISSUER_ADDRESS` added to Vercel
- [ ] MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- [ ] Project redeployed after adding variables
- [ ] `/api/health` endpoint returns healthy status

