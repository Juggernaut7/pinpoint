import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST /api/rounds/close - Auto-close expired rounds (called by cron)
// GET /api/rounds/close - Manual trigger for testing
export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const now = new Date();

    // Find all open rounds that should be closed
    const expiredRounds = await db
      .collection('rounds')
      .find({
        status: 'open',
        closeAt: { $lte: now },
      })
      .toArray();

    if (expiredRounds.length === 0) {
      return NextResponse.json(
        { message: 'No rounds to close', closed: 0 },
        { status: 200 }
      );
    }

    // Close all expired rounds
    const roundIds = expiredRounds.map((r) => r._id);
    const result = await db.collection('rounds').updateMany(
      { _id: { $in: roundIds } },
      { $set: { status: 'closed' } }
    );

    return NextResponse.json(
      {
        message: `Closed ${result.modifiedCount} round(s)`,
        closed: result.modifiedCount,
        roundIds: roundIds.map((id) => id.toString()),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error closing rounds:', error);
    return NextResponse.json(
      { error: 'Failed to close rounds' },
      { status: 500 }
    );
  }
}

