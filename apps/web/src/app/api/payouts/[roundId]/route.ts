import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST /api/payouts/:roundId - Trigger payout for a round (admin/cron)
export async function POST(
  request: NextRequest,
  { params }: { params: { roundId: string } }
) {
  try {
    const roundId = params.roundId;
    const db = await getDb();

    // Get round
    const round = await db
      .collection('rounds')
      .findOne({ _id: new ObjectId(roundId) });

    if (!round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    if (round.status === 'paid') {
      return NextResponse.json(
        { error: 'Round already paid out' },
        { status: 400 }
      );
    }

    // Get all scores for this round
    const scores = await db
      .collection('scores')
      .find({ roundId })
      .sort({ score: 1 }) // Lower is better
      .toArray();

    if (scores.length === 0) {
      return NextResponse.json(
        { error: 'No scores to payout' },
        { status: 400 }
      );
    }

    // Calculate payout distribution - Top 10% model
    const houseFeePercent = Number(process.env.HOUSE_FEE_PERCENT || 5);
    const houseFee = (round.pool * houseFeePercent) / 100;
    const distributable = round.pool - houseFee;

    // Top 10% of players get rewards (minimum 1 winner)
    const totalPlayers = scores.length;
    const top10Percent = Math.max(1, Math.floor(totalPlayers * 0.1));
    const winners = scores.slice(0, top10Percent);

    // New distribution: [20%, 15%, 12%, 10%, 8%, 7%, 6%, 5%, 4%, 3%, then equal shares]
    const percentages = [20, 15, 12, 10, 8, 7, 6, 5, 4, 3];
    const remainingPercent = 100 - percentages.slice(0, Math.min(winners.length, 10)).reduce((a, b) => a + b, 0);
    const remainingWinners = Math.max(0, winners.length - 10);
    const equalSharePercent = remainingWinners > 0 ? remainingPercent / remainingWinners : 0;

    let payouts: Array<{ recipient: string; amount: number }> = [];

    winners.forEach((score, index) => {
      let percent: number;
      if (index < 10) {
        // Top 10 get specific percentages
        percent = percentages[index];
      } else {
        // Remaining winners get equal shares
        percent = equalSharePercent;
      }
      
      payouts.push({
        recipient: score.userAddress,
        amount: (distributable * percent) / 100,
      });
    });

    // TODO: Trigger MiniPay transfers
    // For each payout:
    // 1. Use MiniPay SDK to send cUSD from issuer wallet
    // 2. Store transaction hash
    // 3. Update payout status

    // Save payout records
    const payoutRecords = payouts.map((payout) => ({
      roundId,
      recipient: payout.recipient,
      amount: payout.amount,
      status: 'pending' as const,
      createdAt: new Date(),
    }));

    await db.collection('payouts').insertMany(payoutRecords);

    // Update round status
    await db
      .collection('rounds')
      .updateOne({ _id: new ObjectId(roundId) }, { $set: { status: 'paid' } });

    return NextResponse.json(
      {
        message: 'Payouts calculated',
        payouts: payoutRecords,
        totalAmount: distributable,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing payouts:', error);
    return NextResponse.json(
      { error: 'Failed to process payouts' },
      { status: 500 }
    );
  }
}

