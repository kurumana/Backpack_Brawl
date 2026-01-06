import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type GameAction = 'explorar' | 'cacar' | 'coletar' | 'descansar' | 'construir'

// Gerar evento aleatório baseado na ação
function generateEvent(action: GameAction, roll: number): { result: string; changes: any } {
  const changes: any = {}

  switch (action) {
    case 'explorar':
      if (roll < 30) {
        // Encontrou recursos valiosos
        changes.madeira = Math.floor(Math.random() * 3) + 1
        changes.pedra = Math.floor(Math.random() * 2)
        changes.health = Math.floor(Math.random() * 5)
        changes.score = 10
        return {
          result: `Encontrou um local rico em recursos! Recolheu ${changes.madeira} madeira e ${changes.pedra} pedra.`,
          changes
        }
      } else if (roll < 60) {
        // Exploração normal
        changes.madeira = Math.floor(Math.random() * 2)
        changes.score = 5
        changes.energy = -10
        return {
          result: 'Explorou a floresta e encontrou alguns recursos.',
          changes
        }
      } else if (roll < 80) {
        // Perigo leve
        changes.health = -5
        changes.energy = -15
        return {
          result: 'Trovou em uma planta espinhosa! Perdeu 5 de vida.',
          changes
        }
      } else {
        // Perigo sério
        changes.health = -15
        changes.energy = -20
        return {
          result: 'Escorregou em um declive! Perdeu 15 de vida.',
          changes
        }
      }

    case 'cacar':
      if (roll < 40) {
        // Caçada bem-sucedida
        changes.comida = Math.floor(Math.random() * 2) + 1
        changes.energy = -20
        changes.score = 15
        changes.thirst = -5
        return {
          result: `Caçou com sucesso! Conseguiu ${changes.comida} comida.`,
          changes
        }
      } else if (roll < 70) {
        // Caçada parcial
        changes.comida = 1
        changes.energy = -25
        changes.score = 8
        return {
          result: 'Encontrou um pequeno animal. Conseguiu 1 comida.',
          changes
        }
      } else {
        // Caçada falhou
        changes.energy = -20
        return {
          result: 'Não encontrou nada para caçar. Perdeu tempo e energia.',
          changes
        }
      }

    case 'coletar':
      if (roll < 50) {
        // Coleta bem-sucedida
        changes.frutas = Math.floor(Math.random() * 3) + 2
        changes.agua = Math.floor(Math.random() * 2) + 1
        changes.energy = -5
        changes.score = 8
        changes.thirst = -10
        changes.hunger = -5
        return {
          result: `Encontrou árvores frutíferas! Coletou ${changes.frutas} frutas e ${changes.agua} água.`,
          changes
        }
      } else if (roll < 80) {
        // Coleta parcial
        changes.frutas = Math.floor(Math.random() * 2) + 1
        changes.energy = -5
        changes.score = 5
        changes.hunger = -3
        return {
          result: `Encontrou algumas frutas. Coletou ${changes.frutas}.`,
          changes
        }
      } else {
        // Coleta falhou
        changes.energy = -5
        return {
          result: 'Não encontrou nada para coletar.',
          changes
        }
      }

    case 'descansar':
      changes.energy = 50
      changes.health = 10
      changes.hunger = 10
      changes.thirst = 10
      return {
        result: 'Descansou e recuperou energias. Vida aumentou em 10, mas fome e sede aumentaram.',
        changes
      }

    case 'construir':
      if (roll < 50) {
        // Construiu ferramenta
        changes.ferramenta = 1
        changes.score = 20
        changes.madeira = -3
        changes.pedra = -2
        changes.energy = -15
        return {
          result: 'Construiu uma ferramenta útil! Usou 3 madeira e 2 pedra.',
          changes
        }
      } else if (roll < 80) {
        // Construiu item menor
        changes.faca = 1
        changes.score = 10
        changes.madeira = -2
        changes.pedra = -1
        changes.energy = -10
        return {
          result: 'Criou uma faca de sobrevivência! Usou 2 madeira e 1 pedra.',
          changes
        }
      } else {
        // Falha na construção
        changes.madeira = -1
        changes.energy = -10
        return {
          result: 'A tentativa de construção falhou. Perdeu alguns materiais.',
          changes
        }
      }

    default:
      return {
        result: 'Nada aconteceu.',
        changes: {}
      }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { gameId, action } = await req.json()

    if (!gameId || !action) {
      return NextResponse.json(
        { error: 'ID do jogo e ação são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar jogo atual
    const game = await db.game.findUnique({
      where: { id: gameId },
      include: {
        inventory: true,
        events: true,
      },
    })

    if (!game) {
      return NextResponse.json(
        { error: 'Jogo não encontrado' },
        { status: 404 }
      )
    }

    if (!game.isAlive) {
      return NextResponse.json(
        { error: 'O jogo já terminou' },
        { status: 400 }
      )
    }

    // Verificar se tem recursos suficientes para construção
    if (action === 'construir') {
      const madeira = game.inventory.find(i => i.itemType === 'madeira')?.quantity || 0
      const pedra = game.inventory.find(i => i.itemType === 'pedra')?.quantity || 0

      if (madeira < 1 || pedra < 1) {
        return NextResponse.json(
          { error: 'Você precisa de pelo menos 1 madeira e 1 pedra para construir' },
          { status: 400 }
        )
      }
    }

    // Gerar evento e calcular mudanças
    const roll = Math.random() * 100
    const { result, changes } = generateEvent(action as GameAction, roll)

    // Atualizar status do jogo
    let newHealth = game.health + (changes.health || 0)
    let newHunger = game.hunger + (changes.hunger || 0)
    let newThirst = game.thirst + (changes.thirst || 0)
    let newEnergy = game.energy + (changes.energy || 0)
    let newScore = game.score + (changes.score || 0)

    // Limitar valores
    newHealth = Math.max(0, Math.min(100, newHealth))
    newHunger = Math.max(0, Math.min(100, newHunger))
    newThirst = Math.max(0, Math.min(100, newThirst))
    newEnergy = Math.max(0, Math.min(100, newEnergy))

    // Verificar se o jogador morreu
    const isAlive = newHealth > 0 && newHunger < 100 && newThirst < 100

    // Atualizar jogo
    const updatedGame = await db.game.update({
      where: { id: gameId },
      data: {
        health: newHealth,
        hunger: newHunger,
        thirst: newThirst,
        energy: newEnergy,
        score: newScore,
        day: game.day + 1,
        isAlive,
      },
      include: {
        inventory: true,
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    // Criar registro de evento
    await db.gameEvent.create({
      data: {
        gameId,
        day: game.day + 1,
        action,
        result,
      },
    })

    // Atualizar inventário
    const inventoryUpdates = Object.entries(changes).filter(([key]) =>
      ['madeira', 'pedra', 'comida', 'agua', 'frutas', 'ferramenta', 'faca'].includes(key)
    )

    for (const [itemType, quantity] of inventoryUpdates) {
      const existingItem = updatedGame.inventory.find(i => i.itemType === itemType)
      const newQuantity = quantity as number

      if (existingItem) {
        const finalQuantity = existingItem.quantity + newQuantity
        if (finalQuantity <= 0) {
          // Remover item se quantidade for 0 ou negativa
          await db.inventoryItem.delete({
            where: { id: existingItem.id },
          })
        } else {
          // Atualizar quantidade
          await db.inventoryItem.update({
            where: { id: existingItem.id },
            data: { quantity: finalQuantity },
          })
        }
      } else if (newQuantity > 0) {
        // Criar novo item
        await db.inventoryItem.create({
          data: {
            gameId,
            itemType,
            quantity: newQuantity,
          },
        })
      }
    }

    // Buscar jogo atualizado com todas as mudanças
    const finalGame = await db.game.findUnique({
      where: { id: gameId },
      include: {
        inventory: true,
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json(finalGame)
  } catch (error) {
    console.error('Erro ao executar ação:', error)
    return NextResponse.json(
      { error: 'Erro ao executar ação' },
      { status: 500 }
    )
  }
}
