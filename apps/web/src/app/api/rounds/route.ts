import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { RoundSchema } from '@/lib/models';
import { z } from 'zod';

// GET /api/rounds - Get all active rounds
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const rounds = await db
      .collection('rounds')
      .find({ status: 'open' })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({ rounds }, { status: 200 });
  } catch (error) {
    console.error('Error fetching rounds:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to fetch rounds',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/rounds - Create a new round
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryFee = 1, duration = 3600000 } = body; // entryFee in cUSD (default 1), duration in ms (default 1 hour)

    const db = await getDb();
    const now = new Date();
    const closeAt = new Date(now.getTime() + duration);

    const newRound = {
      status: 'open' as const,
      createdAt: now,
      closeAt,
      entryFee: Number(entryFee),
      pool: 0,
      players: [],
      payoutConfig: {
        topN: 0, // Not used anymore - we use top 10% instead
        distribution: 'top10percent' as const, // New distribution model
      },
    };

    const validatedRound = RoundSchema.parse(newRound);
    const result = await db.collection('rounds').insertOne(validatedRound as any);

    return NextResponse.json(
      { roundId: result.insertedId.toString(), ...validatedRound },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid round data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating round:', error);
    return NextResponse.json(
      { error: 'Failed to create round' },
      { status: 500 }
    );
  }
}

