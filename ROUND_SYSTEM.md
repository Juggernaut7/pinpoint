# PINPOINT Round System Documentation

## 🎮 How Rounds Work

### Round Lifecycle

1. **Round Creation**
   - Rounds are created **automatically** when a user clicks "Enter & play" on the Reward page
   - If no active round exists, a new one is created
   - If an active round exists, user joins that round

2. **Round Duration**
   - **Default: 1 hour** (3,600,000 milliseconds)
   - Configurable via `duration` parameter when creating round
   - Each round has:
     - `createdAt`: When round was created
     - `closeAt`: When round closes (createdAt + duration)
     - `status`: `open` | `closed` | `paid`

3. **Joining a Round**
   - User pays **0.01 cUSD entry fee** (configurable via `ENTRY_FEE` env var)
   - Payment is sent via MiniPay/wallet to issuer address
   - Entry fee is added to the round's pool
   - User is added to `players` array
   - **Users cannot join the same round twice** (checked on backend)

4. **Playing & Submitting Scores**
   - User plays 5 taps, gets average reaction time
   - Score is automatically submitted to API (in reward mode)
   - Score includes:
     - `userAddress`: Player's wallet address
     - `score`: Average reaction time in ms (lower is better)
     - `taps`: Array of 5 individual tap times
     - `proofSignature`: Signed message for anti-cheat (optional for now)

5. **Round Closure**
   - Round closes when `closeAt` time is reached
   - Status changes from `open` to `closed`
   - No new players can join
   - Existing players can still submit scores (if they haven't already)

6. **Payout Calculation**
   - Triggered manually via `POST /api/payouts/:roundId`
   - Calculates winners:
     - Top 10 players (configurable via `TOP_WINNERS_COUNT`)
     - Sorted by score (lowest reaction time = best)
   - Distribution:
     - **House fee**: 5% of pool (configurable via `HOUSE_FEE_PERCENT`)
     - **Distributable**: 95% of pool
     - **Ranked distribution**: [30%, 20%, 15%, 10%, 8%, 6%, 5%, 3%, 2%, 1%]
   - Creates payout records in database
   - Updates round status to `paid`

7. **Payout Execution** (TODO)
   - MiniPay SDK integration needed
   - Send cUSD from issuer wallet to winners
   - Store transaction hashes
   - Update payout status to `sent`

## 📊 Current Implementation Status

### ✅ Implemented
- Round creation (automatic when needed)
- Round joining with entry fee payment
- Score submission with signature
- Payout calculation (ranked distribution)
- Leaderboard (round/daily/weekly)
- Duplicate join prevention
- Real-time pool tracking

### 🚧 Pending
- **Automatic round closure** (currently manual)
- **Automatic payout execution** (currently manual trigger)
- **On-chain transaction verification** (entry fee verification)
- **Signature verification** (anti-cheat)
- **Cron job for payouts** (automated scheduling)

## ⏰ Timeframes

### Current Settings
- **Round Duration**: 1 hour (default)
- **Entry Fee**: 0.01 cUSD
- **House Fee**: 5%
- **Top Winners**: 10 players
- **Distribution**: Ranked (30%, 20%, 15%, 10%, 8%, 6%, 5%, 3%, 2%, 1%)

### Configuration
All settings are in `.env`:
```bash
ENTRY_FEE=0.01
HOUSE_FEE_PERCENT=5
TOP_WINNERS_COUNT=10
```

## 🔄 Round Flow Example

```
1. User A clicks "Enter & play"
   → No active round exists
   → Creates Round #1 (1 hour duration)
   → Pays 0.01 cUSD
   → Pool: 0.01 cUSD

2. User B clicks "Enter & play"
   → Round #1 exists
   → Joins Round #1
   → Pays 0.01 cUSD
   → Pool: 0.02 cUSD

3. User A plays → Score: 120ms → Submitted
4. User B plays → Score: 150ms → Submitted
5. User C joins → Pays 0.01 cUSD → Pool: 0.03 cUSD
6. User C plays → Score: 100ms → Submitted (best!)

7. Round #1 closes (after 1 hour)
   → Status: closed

8. Admin triggers payout
   → Top 3: User C (100ms), User A (120ms), User B (150ms)
   → Distribution:
     - User C: 30% of 0.0285 cUSD = 0.00855 cUSD
     - User A: 20% of 0.0285 cUSD = 0.0057 cUSD
     - User B: 15% of 0.0285 cUSD = 0.004275 cUSD
   → Status: paid

9. User D clicks "Enter & play"
   → No active round exists
   → Creates Round #2 (new round)
```

## 🎯 Questions for Team Lead

1. **Round Duration**: Should rounds be:
   - Fixed duration (1 hour)?
   - Dynamic based on player count?
   - User-configurable?

2. **New Round Creation**: Should we:
   - Auto-create new rounds when current one closes?
   - Allow multiple concurrent rounds?
   - Have a minimum player count before round starts?

3. **Payout Timing**: Should payouts be:
   - Automatic when round closes?
   - Scheduled (e.g., every hour)?
   - Manual trigger only?

4. **Round Closure**: Should we:
   - Auto-close at `closeAt` time?
   - Allow early closure if all players submitted?
   - Extend duration if new players join?

5. **Entry Fee**: Should we:
   - Keep fixed 0.01 cUSD?
   - Allow variable entry fees per round?
   - Have different tiers (bronze/silver/gold)?

