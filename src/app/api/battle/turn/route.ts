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

    const { battleId, action } = await request.json();

    if (!battleId || !action) {
      return NextResponse.json(
        { error: 'Battle ID e action são obrigatórios' },
        { status: 400 }
      );
    }

    // Get battle
    const battle = await db.battle.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      return NextResponse.json(
        { error: 'Batalha não encontrada' },
        { status: 404 }
      );
    }

    if (battle.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Batalha não está em progresso' },
        { status: 400 }
      );
    }

    // Get player character
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

    // Calculate player stats with equipment
    let playerAttack = character.attack;
    let playerDefense = character.defense;

    character.equipment.forEach((eq) => {
      playerAttack += eq.item.attackBonus;
      playerDefense += eq.item.defenseBonus;
    });

    // Enemy stats (based on level)
    const level = character.level;
    const levelBonus = level * 2;
    const enemyAttack = 8 + levelBonus;
    const enemyDefense = 3 + levelBonus / 2;

    // Calculate damage with some randomness
    const playerDamage = Math.max(1, Math.floor(playerAttack - enemyDefense + Math.random() * 5));
    const enemyDamage = Math.max(1, Math.floor(enemyAttack - playerDefense + Math.random() * 5));

    const newPlayerHealth = Math.max(0, battle.player1Health - enemyDamage);
    const newEnemyHealth = Math.max(0, battle.player2Health - playerDamage);

    // Create battle turn log
    await db.battleTurn.create({
      data: {
        battleId,
        playerId: userId,
        turnNumber: battle.currentTurn,
        action,
        damage: playerDamage,
      },
    });

    // Determine winner
    let winner = null;
    let status = 'IN_PROGRESS';

    if (newEnemyHealth <= 0) {
      winner = userId;
      status = 'COMPLETED';
    } else if (newPlayerHealth <= 0) {
      winner = 'enemy';
      status = 'COMPLETED';
    }

    // Update battle
    const updatedBattle = await db.battle.update({
      where: { id: battleId },
      data: {
        player1Health: newPlayerHealth,
        player2Health: newEnemyHealth,
        status: status as any,
        winner,
        currentTurn: battle.currentTurn + 1,
      },
    });

    // If battle completed, update user stats
    if (status === 'COMPLETED') {
      const coinsGained = level * 10;
      const experienceGained = level * 25;

      if (winner === userId) {
        await db.user.update({
          where: { id: userId },
          data: {
            coins: { increment: coinsGained },
            experience: { increment: experienceGained },
            wins: { increment: 1 },
          },
        });

        await db.character.update({
          where: { id: character.id },
          data: {
            wins: { increment: 1 },
          },
        });
      } else {
        await db.user.update({
          where: { id: userId },
          data: {
            losses: { increment: 1 },
          },
        });

        await db.character.update({
          where: { id: character.id },
          data: {
            losses: { increment: 1 },
          },
        });
      }

      return NextResponse.json({
        battle: updatedBattle,
        logs: [
          `⚔️ Você causou ${playerDamage} de dano!`,
          `🛡️ Inimigo causou ${enemyDamage} de dano em você!`,
          winner === userId ? `🎉 Vitória! Você ganhou ${coinsGained} moedas e ${experienceGained} XP!` : `💀 Derrota! Tente novamente!`,
        ],
        winner,
      });
    }

    return NextResponse.json({
      battle: updatedBattle,
      logs: [
        `⚔️ Você causou ${playerDamage} de dano!`,
        `🛡️ Inimigo causou ${enemyDamage} de dano em você!`,
      ],
      winner: null,
    });
  } catch (error) {
    console.error('Battle turn error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar turno' },
      { status: 500 }
    );
  }
}
