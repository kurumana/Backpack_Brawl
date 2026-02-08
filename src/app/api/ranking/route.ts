import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const ranking = await db.user.findMany({
      take: limit,
      orderBy: [
        { wins: 'desc' },
        { level: 'desc' },
      ],
      include: {
        characters: {
          where: { isActive: true },
          take: 1,
        },
      },
      select: {
        id: true,
        name: true,
        level: true,
        wins: true,
        losses: true,
        ranking: true,
        characters: {
          select: {
            name: true,
          },
        },
      },
    });

    // Add rank to each player
    const rankedPlayers = ranking.map((player, index) => ({
      rank: index + 1,
      id: player.id,
      name: player.name,
      characterName: player.characters[0]?.name || 'Guerreiro',
      level: player.level,
      wins: player.wins,
      losses: player.losses,
      winRate: player.wins + player.losses > 0
        ? Math.round((player.wins / (player.wins + player.losses)) * 100)
        : 0,
    }));

    return NextResponse.json({ ranking: rankedPlayers });
  } catch (error) {
    console.error('Get ranking error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ranking' },
      { status: 500 }
    );
  }
}
