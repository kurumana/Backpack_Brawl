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

    const { itemId, slot } = await request.json();

    if (!itemId || !slot) {
      return NextResponse.json(
        { error: 'Item ID e slot são obrigatórios' },
        { status: 400 }
      );
    }

    // Get user's active character
    const character = await db.character.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!character) {
      return NextResponse.json(
        { error: 'Personagem não encontrado' },
        { status: 404 }
      );
    }

    // Check if user has the item in inventory
    const inventoryItem = await db.inventoryItem.findFirst({
      where: {
        userId,
        itemId,
      },
    });

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Item não encontrado no inventário' },
        { status: 404 }
      );
    }

    // Remove existing equipment in the same slot (unequip)
    await db.equipment.deleteMany({
      where: {
        characterId: character.id,
        slot,
      },
    });

    // Equip the new item
    const equipment = await db.equipment.create({
      data: {
        characterId: character.id,
        itemId,
        slot,
      },
    });

    return NextResponse.json({
      success: true,
      equipment,
    });
  } catch (error) {
    console.error('Equip item error:', error);
    return NextResponse.json(
      { error: 'Erro ao equipar item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const slot = searchParams.get('slot');

    if (!slot) {
      return NextResponse.json(
        { error: 'Slot é obrigatório' },
        { status: 400 }
      );
    }

    // Get user's active character
    const character = await db.character.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!character) {
      return NextResponse.json(
        { error: 'Personagem não encontrado' },
        { status: 404 }
      );
    }

    // Unequip the item
    await db.equipment.deleteMany({
      where: {
        characterId: character.id,
        slot: slot as any,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Unequip item error:', error);
    return NextResponse.json(
      { error: 'Erro ao desequipar item' },
      { status: 500 }
    );
  }
}
