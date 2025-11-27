import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { SubmitScoreSchema, PlayerScoreSchema } from '@/lib/models';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
// import { verifyMessage } from 'viem'; // TODO: Implement signature verification

// POST /api/rounds/:id/submit - Submit score for a round
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userAddress, score, taps, proofSignature } =
      SubmitScoreSchema.parse(body);
    const roundId = params.id;

    const db = await getDb();

    // Verify round exists and user joined
    const round = await db
      .collection('rounds')
      .findOne({ _id: new ObjectId(roundId) });

    if (!round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    if (!round.players.includes(userAddress)) {
      return NextResponse.json(
        { error: 'Must join round before submitting score' },
        { status: 400 }
      );
    }

    // Basic anti-cheat: reject impossible scores
    if (score < 50 || taps.some((t: number) => t < 20)) {
      return NextResponse.json(
        { error: 'Score appears invalid' },
        { status: 400 }
      );
    }

    // TODO: Verify signature
    // const message = `${roundId}:${score}:${Date.now()}`;
    // const isValid = await verifyMessage({
    //   address: userAddress as `0x${string}`,
    //   message,
    //   signature: proofSignature as `0x${string}`,
    // });
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    // }

    // Check if score already exists
    const existingScore = await db.collection('scores').findOne({
      roundId,
      userAddress,
    });

    if (existingScore) {
      return NextResponse.json(
        { error: 'Score already submitted for this round' },
        { status: 400 }
      );
    }

    // Save score
    const newScore = {
      roundId,
      userAddress,
      score,
      taps,
      submittedAt: new Date(),
      proofSignature: proofSignature || "0x0000000000000000000000000000000000000000000000000000000000000000",
      claimed: false,
    };

    const validatedScore = PlayerScoreSchema.parse(newScore);
    await db.collection('scores').insertOne(validatedScore as any);

    return NextResponse.json(
      { message: 'Score submitted successfully', score: validatedScore },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      console.error('Received body:', body);
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error submitting score:', error);
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}

