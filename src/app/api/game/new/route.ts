import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { playerName } = await req.json()

    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nome do jogador é obrigatório' },
        { status: 400 }
      )
    }

    // Criar novo jogo
    const game = await db.game.create({
      data: {
        playerName: playerName.trim(),
        health: 100,
        hunger: 0,
        thirst: 0,
        energy: 100,
        score: 0,
        day: 1,
        isAlive: true,
      },
      include: {
        inventory: true,
        events: true,
      },
    })

    return NextResponse.json(game)
  } catch (error) {
    console.error('Erro ao criar jogo:', error)
    return NextResponse.json(
      { error: 'Erro ao criar jogo' },
      { status: 500 }
    )
  }
}
