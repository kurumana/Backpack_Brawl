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

    const { chestType } = await request.json();

    if (!chestType) {
      return NextResponse.json(
        { error: 'Tipo de chest é obrigatório' },
        { status: 400 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Create chest
    const chest = await db.lootChest.create({
      data: {
        userId,
        chestType: chestType as any,
        opened: false,
      },
    });

    // Determine rewards based on chest type
    let rewards = [];
    let coinsGained = 0;

    switch (chestType) {
      case 'BASIC':
        coinsGained = Math.floor(Math.random() * 50) + 20; // 20-70 coins
        rewards = await getRandomItems(1, 2, ['COMMON', 'UNCOMMON']);
        break;
      case 'PREMIUM':
        coinsGained = Math.floor(Math.random() * 100) + 50; // 50-150 coins
        rewards = await getRandomItems(2, 3, ['COMMON', 'UNCOMMON', 'RARE']);
        break;
      case 'EPIC':
        coinsGained = Math.floor(Math.random() * 200) + 100; // 100-300 coins
        rewards = await getRandomItems(3, 4, ['UNCOMMON', 'RARE', 'EPIC']);
        break;
      case 'LEGENDARY':
        coinsGained = Math.floor(Math.random() * 500) + 300; // 300-800 coins
        rewards = await getRandomItems(4, 5, ['RARE', 'EPIC', 'LEGENDARY']);
        break;
    }

    // Give coins
    if (coinsGained > 0) {
      await db.user.update({
        where: { id: userId },
        data: { coins: { increment: coinsGained } },
      });
    }

    // Add items to inventory
    for (const reward of rewards) {
      const existingItem = await db.inventoryItem.findFirst({
        where: { userId, itemId: reward.id },
      });

      if (existingItem) {
        await db.inventoryItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + 1 },
        });
      } else {
        await db.inventoryItem.create({
          data: { userId, itemId: reward.id, quantity: 1 },
        });
      }
    }

    // Mark chest as opened
    await db.lootChest.update({
      where: { id: chest.id },
      data: {
        opened: true,
        openedAt: new Date(),
        rewards: JSON.stringify({ coins: coinsGained, items: rewards }),
      },
    });

    return NextResponse.json({
      success: true,
      rewards: {
        coins: coinsGained,
        items: rewards,
      },
    });
  } catch (error) {
    console.error('Open chest error:', error);
    return NextResponse.json(
      { error: 'Erro ao abrir chest' },
      { status: 500 }
    );
  }
}

async function getRandomItems(minItems: number, maxItems: number, allowedRarities: string[]) {
  const numItems = Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;
  const items = await db.itemTemplate.findMany({
    where: {
      rarity: { in: allowedRarities as any },
      isAvailable: true,
    },
  });

  const selectedItems = [];
  const usedIndices = new Set();

  for (let i = 0; i < numItems; i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * items.length);
    } while (usedIndices.has(randomIndex) && usedIndices.size < items.length);

    usedIndices.add(randomIndex);
    selectedItems.push(items[randomIndex]);
  }

  return selectedItems;
}
