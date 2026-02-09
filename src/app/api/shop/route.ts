import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      console.log('[SHOP API] Unauthorized - no userId provided');
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    console.log('[SHOP API] Loading shop for user:', userId);

    // Get available items from shop (random selection)
    const shopItems = await db.itemTemplate.findMany({
      where: { isAvailable: true },
      orderBy: { basePrice: 'asc' },
      take: 12,
    });

    console.log(`[SHOP API] Shop loaded: ${shopItems.length} items`);
    console.log('[SHOP API] Items:', JSON.stringify(shopItems, null, 2));
    console.log('[SHOP API] First item:', shopItems[0]);

    const responseBody = { shopItems };
    console.log('[SHOP API] Response body:', JSON.stringify(responseBody, null, 2));

    return NextResponse.json(responseBody, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[SHOP API] Get shop error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar loja' },
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

    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID é obrigatório' },
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

    // Get item
    const item = await db.itemTemplate.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      );
    }

    if (user.coins < item.basePrice) {
      return NextResponse.json(
        { error: 'Moedas insuficientes' },
        { status: 400 }
      );
    }

    // Deduct coins and add item to inventory
    await db.user.update({
      where: { id: userId },
      data: {
        coins: user.coins - item.basePrice,
      },
    });

    // Check if user already has this item
    const existingInventoryItem = await db.inventoryItem.findFirst({
      where: { userId, itemId },
    });

    if (existingInventoryItem) {
      await db.inventoryItem.update({
        where: { id: existingInventoryItem.id },
        data: { quantity: existingInventoryItem.quantity + 1 },
      });
    } else {
      await db.inventoryItem.create({
        data: { userId, itemId, quantity: 1 },
      });
    }

    return NextResponse.json({
      success: true,
      remainingCoins: user.coins - item.basePrice,
    });
  } catch (error) {
    console.error('Buy item error:', error);
    return NextResponse.json(
      { error: 'Erro ao comprar item' },
      { status: 500 }
    );
  }
}
