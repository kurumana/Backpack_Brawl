import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);

    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        coins: 100,
        gems: 0,
        level: 1,
        experience: 0,
        ranking: 0,
        wins: 0,
        losses: 0,
      },
    });

    // Create initial character for new user
    const character = await db.character.create({
      data: {
        userId: user.id,
        name: 'Guerreiro Iniciante',
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

    // Give starting items
    const woodenSword = await db.itemTemplate.findFirst({
      where: { name: 'Espada de Madeira' },
    });
    const simpleTunic = await db.itemTemplate.findFirst({
      where: { name: 'Túnica Simples' },
    });

    if (woodenSword) {
      await db.inventoryItem.create({
        data: { userId: user.id, itemId: woodenSword.id, quantity: 1 },
      });
      await db.equipment.create({
        data: {
          characterId: character.id,
          itemId: woodenSword.id,
          slot: 'WEAPON',
        },
      });
    }

    if (simpleTunic) {
      await db.inventoryItem.create({
        data: { userId: user.id, itemId: simpleTunic.id, quantity: 1 },
      });
      await db.equipment.create({
        data: {
          characterId: character.id,
          itemId: simpleTunic.id,
          slot: 'ARMOR',
        },
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    // Calculate total stats with equipment bonuses
    const totalStats = {
      attack: character.attack,
      defense: character.defense,
      health: character.health,
      maxHealth: character.maxHealth,
      speed: character.speed,
      level: character.level,
    };

    // Get equipment to add bonuses
    const equipment = await db.equipment.findMany({
      where: { characterId: character.id },
      include: { item: true },
    });

    equipment.forEach((eq) => {
      totalStats.attack += eq.item.attackBonus;
      totalStats.defense += eq.item.defenseBonus;
      totalStats.health += eq.item.healthBonus;
      totalStats.maxHealth += eq.item.healthBonus;
      totalStats.speed += eq.item.speedBonus;
    });

    return NextResponse.json({
      user: userWithoutPassword,
      character,
      totalStats,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar usuário' },
      { status: 500 }
    );
  }
}
