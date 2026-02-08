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

    const { enemyName, enemyLevel } = await request.json();

    // Get user's active character
    const character = await db.character.findFirst({
      where: { userId, isActive: true },
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
    let totalAttack = character.attack;
    let totalDefense = character.defense;
    let totalHealth = character.health;
    let totalMaxHealth = character.maxHealth;
    let totalSpeed = character.speed;

    character.equipment.forEach((eq) => {
      totalAttack += eq.item.attackBonus;
      totalDefense += eq.item.defenseBonus;
      totalHealth += eq.item.healthBonus;
      totalMaxHealth += eq.item.healthBonus;
      totalSpeed += eq.item.speedBonus;
    });

    // Generate enemy stats
    const levelBonus = enemyLevel * 2;
    const enemyStats = {
      name: enemyName,
      health: 80 + levelBonus * 10,
      maxHealth: 80 + levelBonus * 10,
      attack: 8 + levelBonus,
      defense: 3 + levelBonus / 2,
    };

    // Create battle
    const battle = await db.battle.create({
      data: {
        player1Id: userId,
        player2Id: 'enemy',
        player1Health: totalHealth,
        player2Health: enemyStats.health,
        player1MaxHealth: totalMaxHealth,
        player2MaxHealth: enemyStats.maxHealth,
        status: 'IN_PROGRESS',
        currentTurn: 1,
      },
    });

    return NextResponse.json({
      battle,
      playerStats: {
        name: character.name,
        health: totalHealth,
        maxHealth: totalMaxHealth,
        attack: totalAttack,
        defense: totalDefense,
        speed: totalSpeed,
      },
      enemyStats,
    });
  } catch (error) {
    console.error('Create battle error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar batalha' },
      { status: 500 }
    );
  }
}
