import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { JoinRoundSchema } from '@/lib/models';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

// POST /api/rounds/:id/join - Join a round (validate entry fee payment)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userAddress, txHash } = JoinRoundSchema.parse(body);
    const roundId = params.id;

    const db = await getDb();

    // Verify round exists and is open
    const round = await db
      .collection('rounds')
      .findOne({ _id: new ObjectId(roundId) });

    // Auto-close if past closeAt time
    if (round && round.status === 'open' && new Date(round.closeAt) <= new Date()) {
      await db.collection('rounds').updateOne(
        { _id: new ObjectId(roundId) },
        { $set: { status: 'closed' } }
      );
      return NextResponse.json(
        { error: 'Round has closed' },
        { status: 400 }
      );
    }

    if (!round || round.status !== 'open') {
      return NextResponse.json(
        { error: 'Round not found or closed' },
        { status: 404 }
      );
    }

    // Check if user already joined
    if (round.players.includes(userAddress)) {
      return NextResponse.json(
        { error: 'Already joined this round' },
        { status: 400 }
      );
    }

    // TODO: Verify transaction hash on-chain
    // For now, we'll trust the client but in production, verify:
    // 1. Transaction exists on Celo
    // 2. Transaction is from userAddress to issuer address
    // 3. Amount matches entryFee
    // 4. Transaction is confirmed

    // Add player to round and update pool
    const entryFee = round.entryFee;
    await db.collection('rounds').updateOne(
      { _id: new ObjectId(roundId) },
      {
        $push: { players: userAddress as any },
        $inc: { pool: entryFee },
      }
    );

    return NextResponse.json(
      { message: 'Successfully joined round', roundId },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      console.error('Received body:', body);
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error joining round:', error);
    return NextResponse.json(
      { error: 'Failed to join round' },
      { status: 500 }
    );
  }
}

