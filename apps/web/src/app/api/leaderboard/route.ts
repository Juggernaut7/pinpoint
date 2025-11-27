import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET /api/leaderboard - Get leaderboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'round'; // round, daily, weekly
    const roundId = searchParams.get('roundId');

    const db = await getDb();

    let query: any = {};
    let sortBy: any = { score: 1 }; // Lower is better

    if (scope === 'round' && roundId) {
      query = { roundId };
    } else if (scope === 'daily') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = { submittedAt: { $gte: today } };
    } else if (scope === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = { submittedAt: { $gte: weekAgo } };
    }

    const scores = await db
      .collection('scores')
      .find(query)
      .sort(sortBy)
      .limit(100)
      .toArray();

    // Format for frontend
    const leaderboard = scores.map((score, index) => {
      const submittedAt = new Date(score.submittedAt);
      const now = new Date();
      const diffMs = now.getTime() - submittedAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const timeAgo = diffMins < 1 ? "Just now" : diffMins === 1 ? "1 min ago" : `${diffMins} min ago`;
      
      return {
        rank: index + 1,
        user: `${score.userAddress.slice(0, 4)}…${score.userAddress.slice(-4)}`,
        score: score.score,
        time: timeAgo,
        timestamp: score.submittedAt,
      };
    });

    return NextResponse.json({ leaderboard, scope }, { status: 200 });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

