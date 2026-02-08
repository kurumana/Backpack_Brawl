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

    const character = await db.character.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        equipment: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!character) {
      return NextResponse.json(
        { error: 'Personagem não encontrado' },
        { status: 404 }
      );
    }

    // Calculate total stats with equipment bonuses
    const totalStats = {
      attack: character.attack,
      defense: character.defense,
      health: character.health,
      maxHealth: character.maxHealth,
      speed: character.speed,
    };

    character.equipment.forEach((eq) => {
      totalStats.attack += eq.item.attackBonus;
      totalStats.defense += eq.item.defenseBonus;
      totalStats.health += eq.item.healthBonus;
      totalStats.maxHealth += eq.item.healthBonus;
      totalStats.speed += eq.item.speedBonus;
    });

    return NextResponse.json({
      character,
      totalStats,
    });
  } catch (error) {
    console.error('Get character error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar personagem' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { name, avatar } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Nome do personagem é obrigatório' },
        { status: 400 }
      );
    }

    // Set current active character to inactive
    await db.character.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    const character = await db.character.create({
      data: {
        userId,
        name,
        avatar,
        level: 1,
        health: 100,
        maxHealth: 100,
        attack: 10,
        defense: 5,
        speed: 5,
        wins: 0,
        losses: 0,
        isActive: true,
      },
    });

    return NextResponse.json({ character });
  } catch (error) {
    console.error('Create character error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar personagem' },
      { status: 500 }
    );
  }
}
