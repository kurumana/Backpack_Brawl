import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      include: {
        characters: {
          where: { isActive: true },
          include: {
            equipment: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }

    const hashedPassword = hashPassword(password);

    if (user.password !== hashedPassword) {
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;

    // Calculate total stats with equipment bonuses
    let totalStats = null;
    const character = user.characters[0];

    if (character) {
      totalStats = {
        attack: character.attack,
        defense: character.defense,
        health: character.health,
        maxHealth: character.maxHealth,
        speed: character.speed,
        level: character.level,
      };

      character.equipment.forEach((eq) => {
        totalStats.attack += eq.item.attackBonus;
        totalStats.defense += eq.item.defenseBonus;
        totalStats.health += eq.item.healthBonus;
        totalStats.maxHealth += eq.item.healthBonus;
        totalStats.speed += eq.item.speedBonus;
      });
    }

    return NextResponse.json({
      user: userWithoutPassword,
      character: character,
      totalStats,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}
