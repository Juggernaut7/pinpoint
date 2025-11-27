import { z } from 'zod';

// Round Schema
export const RoundSchema = z.object({
  _id: z.string().optional(),
  status: z.enum(['open', 'closed', 'paid']),
  createdAt: z.date(),
  closeAt: z.date(),
  entryFee: z.number(),
  pool: z.number(),
  players: z.array(z.string()), // Array of wallet addresses
  payoutConfig: z.object({
    topN: z.number(),
    distribution: z.enum(['ranked', 'equal', 'top10percent']),
  }),
});

export type Round = z.infer<typeof RoundSchema>;

// Player Score Schema
export const PlayerScoreSchema = z.object({
  _id: z.string().optional(),
  roundId: z.string(),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  score: z.number(), // Average reaction time in ms
  taps: z.array(z.number()), // Individual tap reaction times
  submittedAt: z.date(),
  proofSignature: z.string().refine(
    (val) => val === "" || /^0x[a-fA-F0-9]+$/.test(val),
    { message: "Signature must be empty or valid hex string starting with 0x" }
  ),
  claimed: z.boolean().default(false),
  ipfsCid: z.string().optional(),
});

export type PlayerScore = z.infer<typeof PlayerScoreSchema>;

// Payout Schema
export const PayoutSchema = z.object({
  _id: z.string().optional(),
  roundId: z.string(),
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amount: z.number(),
  txHash: z.string().regex(/^0x[a-fA-F0-9]+$/).optional(),
  status: z.enum(['pending', 'sent', 'failed']),
  createdAt: z.date(),
});

export type Payout = z.infer<typeof PayoutSchema>;

// API Request/Response Types
export const JoinRoundSchema = z.object({
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  txHash: z.string().regex(/^0x[a-fA-F0-9]+$/), // Entry fee transaction hash
});

export const SubmitScoreSchema = z.object({
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  score: z.number(),
  taps: z.array(z.number()),
  proofSignature: z.string().refine(
    (val) => val === "" || /^0x[a-fA-F0-9]+$/.test(val),
    { message: "Signature must be empty or valid hex string starting with 0x" }
  ),
});

