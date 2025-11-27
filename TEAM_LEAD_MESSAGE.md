# Message for Team Lead

---

**Subject: PINPOINT Round System - Need Guidance on Round Management & Payout Strategy**

Hey [Team Lead Name],

We've made solid progress on PINPOINT! The core game mechanics, wallet integration, and API are all working. Before we finalize the round management and payout system, we need your input on a few key decisions.

## What We've Built So Far

✅ **Complete Game Flow**
- Practice mode (free) and Reward mode (paid)
- 5-tap reaction timer with score calculation
- Wallet integration (MetaMask, Rabby, MiniPay)
- Entry fee payment (0.01 cUSD via cUSD transfer)
- Score submission with signature generation
- Leaderboard system (round/daily/weekly)

✅ **Backend API**
- Round creation and management
- Player joining with entry fee
- Score submission and validation
- Payout calculation (ranked distribution: 30%, 20%, 15%, etc.)
- MongoDB integration

✅ **Current Round System**
- Rounds auto-create when first user joins (if no active round exists)
- Default duration: **1 hour**
- Entry fee: **0.01 cUSD**
- House fee: **5%**
- Top 10 winners get ranked distribution

## Questions We Need Answered

### 1. **Round Duration & Management**
Currently, rounds are set to 1 hour. Should we:
- **Option A**: Keep fixed 1-hour rounds
- **Option B**: Dynamic duration (e.g., 30 min if <10 players, 1 hour if 10+)
- **Option C**: User-configurable duration per round
- **Option D**: Continuous rounds (new round starts immediately when old one closes)

**Current behavior**: Rounds auto-create when needed, but don't auto-close. We need to decide on:
- Should rounds auto-close at `closeAt` time?
- Should we allow multiple concurrent rounds?
- Minimum player count before round starts?

### 2. **New Round Availability**
When should new rounds become available?
- **Option A**: Immediately when current round closes
- **Option B**: Only when current round is paid out
- **Option C**: Allow multiple concurrent rounds (different entry fees?)
- **Option D**: Scheduled rounds (e.g., every hour on the hour)

### 3. **Payout Timing & Automation**
Currently, payouts are manual trigger only. Should we:
- **Option A**: Automatic payout when round closes
- **Option B**: Scheduled payouts (cron job every X minutes)
- **Option C**: Manual trigger only (for now)
- **Option D**: Hybrid (auto for small amounts, manual for large)

**Note**: Payout calculation is done, but actual MiniPay transfers are still TODO.

### 4. **Round Closure Strategy**
- Should rounds auto-close at `closeAt` time?
- Should we allow early closure if all players have submitted?
- Should we extend duration if new players join near closing time?
- What happens to players who join but never submit a score?

### 5. **Entry Fee & Round Tiers**
Currently fixed at 0.01 cUSD. Should we:
- **Option A**: Keep fixed entry fee
- **Option B**: Variable entry fees per round (user chooses)
- **Option C**: Tiered rounds (Bronze: 0.01, Silver: 0.05, Gold: 0.10)
- **Option D**: Dynamic entry fee based on pool size

## Current Implementation Details

**Round Creation**:
```typescript
// Auto-creates when user joins and no active round exists
POST /api/rounds
{
  entryFee: 0.01,
  duration: 3600000  // 1 hour in ms
}
```

**Payout Calculation**:
```typescript
// Manual trigger
POST /api/payouts/:roundId
// Calculates top 10 winners
// Distribution: [30%, 20%, 15%, 10%, 8%, 6%, 5%, 3%, 2%, 1%]
// House fee: 5% of pool
```

**What's Working**:
- ✅ Round creation
- ✅ Player joining with payment
- ✅ Score submission
- ✅ Payout calculation
- ✅ Leaderboard

**What's Pending**:
- ⚠️ Automatic round closure
- ⚠️ Automatic payout execution (MiniPay SDK integration)
- ⚠️ On-chain transaction verification
- ⚠️ Cron jobs for automation

## Recommendation

For hackathon demo, I suggest:
1. **Fixed 1-hour rounds** (simple, predictable)
2. **Auto-create new round** when current one closes
3. **Manual payout trigger** for demo (we can show the calculation)
4. **Auto-close at `closeAt` time** (prevent new joins)

But open to your guidance on what makes most sense for the product vision!

Let me know your thoughts and we'll implement accordingly. We can have this ready for demo in the next day or two once we lock in the strategy.

Thanks!

---

**Files to Review**:
- `ROUND_SYSTEM.md` - Detailed round system documentation
- `PROJECT_SUMMARY.md` - Complete project summary
- `apps/web/src/app/api/rounds/route.ts` - Round creation logic
- `apps/web/src/app/api/payouts/[roundId]/route.ts` - Payout calculation

