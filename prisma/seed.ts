import { db } from '@/lib/db';
import { ItemRarity, ItemType, ChestType } from '@prisma/client';

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await db.inventoryItem.deleteMany();
  await db.equipment.deleteMany();
  await db.character.deleteMany();
  await db.battleTurn.deleteMany();
  await db.battle.deleteMany();
  await db.shopPurchase.deleteMany();
  await db.shopItem.deleteMany();
  await db.lootChest.deleteMany();
  await db.user.deleteMany();
  await db.itemTemplate.deleteMany();

  console.log('✅ Cleared existing data');

  // Create Items
  const weapons = [
    { name: 'Espada de Madeira', type: ItemType.WEAPON, rarity: ItemRarity.COMMON, attackBonus: 5, basePrice: 10 },
    { name: 'Espada de Ferro', type: ItemType.WEAPON, rarity: ItemRarity.COMMON, attackBonus: 10, basePrice: 25 },
    { name: 'Machado de Guerra', type: ItemType.WEAPON, rarity: ItemRarity.UNCOMMON, attackBonus: 15, basePrice: 50 },
    { name: 'Espada de Aço', type: ItemType.WEAPON, rarity: ItemRarity.UNCOMMON, attackBonus: 18, basePrice: 75 },
    { name: 'Lâmina Sombria', type: ItemType.WEAPON, rarity: ItemRarity.RARE, attackBonus: 25, basePrice: 150 },
    { name: 'Martelo do Trovão', type: ItemType.WEAPON, rarity: ItemRarity.RARE, attackBonus: 28, basePrice: 200 },
    { name: 'Excalibur', type: ItemType.WEAPON, rarity: ItemRarity.EPIC, attackBonus: 40, basePrice: 500 },
    { name: 'Espada do Destino', type: ItemType.WEAPON, rarity: ItemRarity.LEGENDARY, attackBonus: 60, basePrice: 1000 },
  ];

  const armors = [
    { name: 'Túnica Simples', type: ItemType.ARMOR, rarity: ItemRarity.COMMON, defenseBonus: 3, healthBonus: 10, basePrice: 15 },
    { name: 'Armadura de Couro', type: ItemType.ARMOR, rarity: ItemRarity.COMMON, defenseBonus: 5, healthBonus: 15, basePrice: 30 },
    { name: 'Armadura de Ferro', type: ItemType.ARMOR, rarity: ItemRarity.UNCOMMON, defenseBonus: 10, healthBonus: 25, basePrice: 60 },
    { name: 'Armadura de Aço', type: ItemType.ARMOR, rarity: ItemRarity.UNCOMMON, defenseBonus: 12, healthBonus: 30, basePrice: 90 },
    { name: 'Armadura de Placas', type: ItemType.ARMOR, rarity: ItemRarity.RARE, defenseBonus: 18, healthBonus: 45, basePrice: 180 },
    { name: 'Armadura Dragônica', type: ItemType.ARMOR, rarity: ItemRarity.EPIC, defenseBonus: 25, healthBonus: 60, basePrice: 450 },
    { name: 'Armadura Divina', type: ItemType.ARMOR, rarity: ItemRarity.LEGENDARY, defenseBonus: 40, healthBonus: 100, basePrice: 900 },
  ];

  const accessories = [
    { name: 'Anel de Sorte', type: ItemType.ACCESSORY, rarity: ItemRarity.COMMON, speedBonus: 2, basePrice: 20 },
    { name: 'Amuleto de Força', type: ItemType.ACCESSORY, rarity: ItemRarity.UNCOMMON, attackBonus: 5, basePrice: 40 },
    { name: 'Anel de Proteção', type: ItemType.ACCESSORY, rarity: ItemRarity.UNCOMMON, defenseBonus: 5, basePrice: 40 },
    { name: 'Colar de Velocidade', type: ItemType.ACCESSORY, rarity: ItemRarity.RARE, speedBonus: 8, basePrice: 120 },
    { name: 'Anel de Poder', type: ItemType.ACCESSORY, rarity: ItemRarity.EPIC, attackBonus: 10, defenseBonus: 10, basePrice: 400 },
    { name: 'Coroa do Rei', type: ItemType.ACCESSORY, rarity: ItemRarity.LEGENDARY, attackBonus: 15, defenseBonus: 15, speedBonus: 10, basePrice: 800 },
  ];

  const potions = [
    { name: 'Poção de Vida Pequena', type: ItemType.POTION, rarity: ItemRarity.COMMON, healthBonus: 20, basePrice: 10 },
    { name: 'Poção de Vida Média', type: ItemType.POTION, rarity: ItemRarity.UNCOMMON, healthBonus: 40, basePrice: 25 },
    { name: 'Poção de Vida Grande', type: ItemType.POTION, rarity: ItemRarity.RARE, healthBonus: 80, basePrice: 60 },
    { name: 'Elixir de Força', type: ItemType.POTION, rarity: ItemRarity.EPIC, attackBonus: 20, basePrice: 200 },
  ];

  const materials = [
    { name: 'Minério de Ferro', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON, basePrice: 5 },
    { name: 'Minério de Ouro', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON, basePrice: 15 },
    { name: 'Cristal Mágico', type: ItemType.MATERIAL, rarity: ItemRarity.RARE, basePrice: 50 },
    { name: 'Essência Dragônica', type: ItemType.MATERIAL, rarity: ItemRarity.EPIC, basePrice: 150 },
    { name: 'Essência Divina', type: ItemType.MATERIAL, rarity: ItemRarity.LEGENDARY, basePrice: 500 },
  ];

  const allItems = [...weapons, ...armors, ...accessories, ...potions, ...materials];

  for (const item of allItems) {
    await db.itemTemplate.create({
      data: {
        ...item,
        description: `Um poderoso ${item.name.toLowerCase()} de ${item.rarity.toLowerCase()}`,
      },
    });
  }

  console.log(`✅ Created ${allItems.length} items`);

  // Create demo user
  const demoUser = await db.user.create({
    data: {
      email: 'demo@backpackbrawl.com',
      name: 'Demo Warrior',
      password: 'demo123',
      coins: 500,
      level: 5,
      experience: 2500,
      ranking: 100,
      wins: 25,
      losses: 10,
    },
  });

  console.log('✅ Created demo user');

  // Create demo character
  const demoCharacter = await db.character.create({
    data: {
      userId: demoUser.id,
      name: 'Guerreiro Lendário',
      level: 5,
      health: 150,
      maxHealth: 150,
      attack: 35,
      defense: 20,
      speed: 15,
      wins: 25,
      losses: 10,
      isActive: true,
    },
  });

  console.log('✅ Created demo character');

  // Give demo user some starting items
  const commonSword = await db.itemTemplate.findFirst({ where: { name: 'Espada de Madeira' } });
  const ironArmor = await db.itemTemplate.findFirst({ where: { name: 'Armadura de Ferro' } });
  const luckyRing = await db.itemTemplate.findFirst({ where: { name: 'Anel de Sorte' } });

  if (commonSword) {
    await db.inventoryItem.create({
      data: { userId: demoUser.id, itemId: commonSword.id, quantity: 1 },
    });
  }

  if (ironArmor) {
    await db.inventoryItem.create({
      data: { userId: demoUser.id, itemId: ironArmor.id, quantity: 1 },
    });
  }

  if (luckyRing) {
    await db.inventoryItem.create({
      data: { userId: demoUser.id, itemId: luckyRing.id, quantity: 1 },
    });
  }

  // Equip items to demo character
  if (commonSword) {
    await db.equipment.create({
      data: { characterId: demoCharacter.id, itemId: commonSword.id, slot: 'WEAPON' },
    });
  }

  if (ironArmor) {
    await db.equipment.create({
      data: { characterId: demoCharacter.id, itemId: ironArmor.id, slot: 'ARMOR' },
    });
  }

  if (luckyRing) {
    await db.equipment.create({
      data: { characterId: demoCharacter.id, itemId: luckyRing.id, slot: 'ACCESSORY' },
    });
  }

  console.log('✅ Created demo inventory and equipment');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
