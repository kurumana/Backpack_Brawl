import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const inventoryItems = await db.inventoryItem.findMany({
      where: { userId },
      include: { item: true },
      orderBy: { obtainedAt: 'desc' },
    });

    return NextResponse.json({ inventoryItems });
  } catch (error) {
    console.error('Get inventory error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar inventário' },
      { status: 500 }
    );
  }
}
