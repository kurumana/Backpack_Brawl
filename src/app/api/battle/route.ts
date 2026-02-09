import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { won, coinsGained } = await request.json();

    // Update user stats
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        wins: won ? user.wins + 1 : user.wins,
        losses: won ? user.losses : user.losses + 1,
        coins: won ? user.coins + coinsGained : user.coins,
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Battle result error:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar resultado da batalha' },
      { status: 500 }
    );
  }
}
