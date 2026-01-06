import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const gameId = searchParams.get('gameId')

    if (!gameId) {
      return NextResponse.json(
        { error: 'ID do jogo é obrigatório' },
        { status: 400 }
      )
    }

    // Carregar jogo existente
    const game = await db.game.findUnique({
      where: { id: gameId },
      include: {
        inventory: true,
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!game) {
      return NextResponse.json(
        { error: 'Jogo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(game)
  } catch (error) {
    console.error('Erro ao carregar jogo:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar jogo' },
      { status: 500 }
    )
  }
}
