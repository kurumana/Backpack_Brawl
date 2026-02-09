'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Swords,
  Shield,
  Zap,
  Crown,
  Coins,
  Gem,
  Package,
  Store,
  Trophy,
  User,
  Mail,
  Lock,
  UserPlus,
  Sparkles,
  Heart,
  Swords as WeaponIcon,
  Armchair as ArmorIcon,
  Circle as AccessoryIcon,
} from 'lucide-react';

type User = {
  id: string;
  email: string;
  name: string;
  coins: number;
  gems: number;
  level: number;
  experience: number;
  ranking: number;
  wins: number;
  losses: number;
};

type Character = {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  wins: number;
  losses: number;
  equipment?: any[];
};

type TotalStats = {
  attack: number;
  defense: number;
  health: number;
  maxHealth: number;
  speed: number;
  level: number;
};

type Equipment = {
  id: string;
  slot: string;
  item: Item;
};

type Item = {
  id: string;
  name: string;
  type: string;
  rarity: string;
  attackBonus: number;
  defenseBonus: number;
  healthBonus: number;
  speedBonus: number;
  basePrice: number;
};

export default function BackpackBrawl() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [totalStats, setTotalStats] = useState<TotalStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('battle');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Battle state
  const [enemy, setEnemy] = useState<any>(null);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isInBattle, setIsInBattle] = useState(false);
  const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const battleShouldContinueRef = useRef(false); // Flag para evitar problemas de closure
  const characterRef = useRef(character);
  const totalStatsRef = useRef(totalStats);
  const enemyRef = useRef(enemy);

  // Inventory and shop state
  const [inventory, setInventory] = useState<any[]>([]);
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);

  // Login functions
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setCharacter(data.character);
        setEquipment(data.character.equipment || []);
        setTotalStats(data.totalStats);
        setIsAuthenticated(true);
        localStorage.setItem('userId', data.user.id);
        // Carregar loja e inventário após login
        await loadShopItems();
        await loadInventory();
        console.log('[LOGIN] Stats carregados', {
          totalStats: data.totalStats,
          character: data.character,
        });
      } else {
        alert(data.error || 'Erro ao fazer login');
      }
    } catch (error) {
      alert('Erro ao fazer login');
    }
    setIsLoading(false);
  };

  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setCharacter(data.character);
        setEquipment(data.character.equipment || []);
        setTotalStats(data.totalStats);
        setIsAuthenticated(true);
        localStorage.setItem('userId', data.user.id);
        // Carregar loja e inventário após registro
        await loadShopItems();
        await loadInventory();
        console.log('[REGISTER] Stats carregados', {
          totalStats: data.totalStats,
          character: data.character,
        });
      } else {
        alert(data.error || 'Erro ao registrar');
      }
    } catch (error) {
      alert('Erro ao registrar');
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCharacter(null);
    setTotalStats(null);
    setShopItems([]);
    setIsAuthenticated(false);
    localStorage.removeItem('userId');
  };

  const generateEnemy = () => {
    const names = ['Orc Guerreiro', 'Dragão Menor', 'Lobo Alfa', 'Mago Sombrio', 'Gigante'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const level = character?.level || 1;
    const levelBonus = level * 2;

    return {
      name: randomName,
      level: level,
      health: 80 + levelBonus * 10,
      maxHealth: 80 + levelBonus * 10,
      attack: 8 + levelBonus,
      defense: 3 + levelBonus / 2,
    };
  };

  const findBattle = () => {
    console.log('[BATTLE] findBattle chamado');
    // Para qualquer batalha anterior que esteja rodando
    if (battleIntervalRef.current) {
      clearInterval(battleIntervalRef.current);
      battleIntervalRef.current = null;
    }
    // Reseta a flag de batalha
    battleShouldContinueRef.current = false;

    const newEnemy = generateEnemy();
    setEnemy(newEnemy);
    setPlayerHealth(totalStats?.health || character?.health || 100);
    setEnemyHealth(newEnemy.health);
    setBattleLog([`⚔️ Inimigo encontrado: ${newEnemy.name}! Clique em Iniciar Batalha Automática!`]);
    // Reseta o estado de batalha anterior
    setIsInBattle(false);

    console.log('[BATTLE] Inimigo gerado', {
      enemyName: newEnemy.name,
      enemyHealth: newEnemy.health,
      totalStats: totalStats,
      characterHealth: character?.health,
      playerHealth: totalStats?.health || character?.health || 100,
    });
  };

  const startBattle = () => {
    console.log('[BATTLE] startBattle chamado', {
      battleShouldContinueRef: battleShouldContinueRef.current,
      enemyRef: enemyRef.current,
      totalStatsRef: totalStatsRef.current,
      characterRef: characterRef.current,
    });

    setIsInBattle(true);
    battleShouldContinueRef.current = true; // Ativa a flag para os ataques

    // Limpa intervalo anterior se existir
    if (battleIntervalRef.current) {
      clearInterval(battleIntervalRef.current);
    }

    setBattleLog((prev) => [...prev, `⚔️ Batalha automática iniciada!`]);

    console.log('[BATTLE] Intervalo iniciado, battleShouldContinue:', battleShouldContinueRef.current);

    // Inicia batalha automática
    battleIntervalRef.current = setInterval(() => {
      performSingleAttack();
    }, 1000); // Ataca a cada 1 segundo
  };

  const performSingleAttack = () => {
    console.log('[BATTLE] performSingleAttack chamado', {
      character: !!characterRef.current,
      enemy: !!enemyRef.current,
      totalStats: !!totalStatsRef.current,
      battleShouldContinue: battleShouldContinueRef.current,
      enemyName: enemyRef.current?.name,
      totalStatsValue: totalStatsRef.current,
    });

    if (!characterRef.current || !enemyRef.current || !totalStatsRef.current || !battleShouldContinueRef.current) {
      console.log('[BATTLE] Retornando cedo - uma das condições não foi atendida');
      if (battleIntervalRef.current) {
        clearInterval(battleIntervalRef.current);
        battleIntervalRef.current = null;
      }
      return;
    }

    const currentEnemy = enemyRef.current;
    const currentTotalStats = totalStatsRef.current;

    const playerDamage = Math.max(1, currentTotalStats.attack - currentEnemy.defense + Math.floor(Math.random() * 5));
    const enemyDamage = Math.max(1, currentEnemy.attack - currentTotalStats.defense + Math.floor(Math.random() * 5));

    console.log('[BATTLE] Ataque executado', {
      playerDamage,
      enemyDamage,
      playerName: characterRef.current?.name,
      enemyName: currentEnemy.name,
    });

    setPlayerHealth((current) => Math.max(0, current - enemyDamage));
    setEnemyHealth((current) => Math.max(0, current - playerDamage));

    setBattleLog((prev) => [
      ...prev,
      `⚔️ Você causou ${playerDamage} de dano!`,
      `🛡️ ${currentEnemy.name} causou ${enemyDamage} de dano em você!`,
    ]);
  };

  const saveBattleResult = async (won: boolean, coinsGained: number) => {
    try {
      const response = await fetch('/api/battle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('userId') || '',
        },
        body: JSON.stringify({ won, coinsGained }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        console.log('[BATTLE] Resultado salvo no backend', {
          won,
          coinsGained,
          user: data.user,
        });
      } else {
        console.error('[BATTLE] Erro ao salvar resultado', data.error);
      }
    } catch (error) {
      console.error('[BATTLE] Erro ao salvar resultado da batalha:', error);
    }
  };

  // Monitora o fim da batalha
  useEffect(() => {
    if (!battleShouldContinueRef.current) {
      // Se a flag não está ativa, limpa qualquer intervalo
      if (battleIntervalRef.current) {
        clearInterval(battleIntervalRef.current);
        battleIntervalRef.current = null;
      }
      return;
    }

    // Verifica se alguém perdeu
    if (playerHealth <= 0) {
      battleShouldContinueRef.current = false; // Desativa a flag
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsInBattle(false);
      const enemyName = enemyRef.current?.name || 'inimigo';
      setEnemy(null); // Limpa o inimigo após derrota
      setBattleLog((prev) => [
        ...prev,
        `💀 Derrota! Você foi derrotado por ${enemyName}!`,
      ]);

      // Salvar resultado no backend
      saveBattleResult(false, 0);
    }
    // Verifica se o inimigo perdeu
    else if (enemyHealth <= 0) {
      battleShouldContinueRef.current = false; // Desativa a flag
      setIsInBattle(false);
      const enemyName = enemyRef.current?.name || 'inimigo';
      const level = totalStatsRef.current?.level || characterRef.current?.level || 1;
      const coinsGained = level * 10;
      setEnemy(null); // Limpa o inimigo após vitória
      setBattleLog((prev) => [
        ...prev,
        `🎉 Vitória! Você derrotou ${enemyName}!`,
        `💰 Ganhou ${coinsGained} moedas!`,
      ]);

      // Salvar resultado no backend
      saveBattleResult(true, coinsGained);
    }
  }, [playerHealth, enemyHealth]);

  const handlePurchase = async (item: any) => {
    if (!user || user.coins < item.basePrice) return;


    try {
      const response = await fetch('/api/shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('userId') || '',
        },
        body: JSON.stringify({ itemId: item.id }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser({ ...user, coins: data.remainingCoins });
        
        // Recarrega o inventário do backend
        await loadInventory();
        
        alert(`✅ Compra realizada! Você comprou ${item.name}`);
      } else {
        alert(data.error || 'Erro ao comprar item');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Erro ao comprar item');
    }
  };

  const handleEquip = async (itemId: string, slot: string) => {
    try {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('userId') || '',
        },
        body: JSON.stringify({ itemId, slot }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await loadCharacterWithEquipment();
        alert('✅ Item equipado com sucesso!');
      } else {
        alert(data.error || 'Erro ao equipar item');
      }
    } catch (error) {
      console.error('Equip error:', error);
      alert('Erro ao equipar item');
    }
  };

  const handleUnequip = async (slot: string) => {
    try {
      const response = await fetch(`/api/equipment?slot=${slot}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': localStorage.getItem('userId') || '',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await loadCharacterWithEquipment();
        alert('✅ Item desequipado com sucesso!');
      } else {
        alert(data.error || 'Erro ao desequipar item');
      }
    } catch (error) {
      console.error('Unequip error:', error);
      alert('Erro ao desequipar item');
    }
  };

  const loadCharacterWithEquipment = async () => {
    try {
      const response = await fetch('/api/character', {
        headers: {
          'x-user-id': localStorage.getItem('userId') || '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCharacter(data.character);
        setEquipment(data.character.equipment || []);
        setTotalStats(data.totalStats); // Armazena os stats totais calculados
        console.log('[CHARACTER] Stats carregados com sucesso', {
          totalStats: data.totalStats,
          equipment: data.character.equipment?.length,
        });
      } else {
        console.error('[CHARACTER] Erro ao carregar character', response.status);
      }
    } catch (error) {
      console.error('Error loading character:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY': return 'text-yellow-500';
      case 'EPIC': return 'text-purple-500';
      case 'RARE': return 'text-blue-500';
      case 'UNCOMMON': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY': return 'Lendário';
      case 'EPIC': return 'Épico';
      case 'RARE': return 'Raro';
      case 'UNCOMMON': return 'Incomum';
      default: return 'Comum';
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'WEAPON': return <WeaponIcon className="w-4 h-4 text-orange-400" />;
      case 'ARMOR': return <ArmorIcon className="w-4 h-4 text-blue-400" />;
      case 'ACCESSORY': return <AccessoryIcon className="w-4 h-4 text-yellow-400" />;
      case 'POTION': return <Sparkles className="w-4 h-4 text-green-400" />;
      default: return <Package className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEquippedItem = (slot: string) => {
    return equipment.find((eq: any) => eq.slot === slot)?.item;
  };

  const getSlotName = (slot: string) => {
    switch (slot) {
      case 'WEAPON': return 'Arma';
      case 'ARMOR': return 'Armadura';
      case 'HELMET': return 'Capacete';
      case 'ACCESSORY': return 'Acessório';
      default: return slot;
    }
  };

  const getSlotIcon = (slot: string) => {
    switch (slot) {
      case 'WEAPON': return <WeaponIcon className="w-5 h-5 text-orange-400" />;
      case 'ARMOR': return <ArmorIcon className="w-5 h-5 text-blue-400" />;
      case 'HELMET': return <Crown className="w-5 h-5 text-purple-400" />;
      case 'ACCESSORY': return <AccessoryIcon className="w-5 h-5 text-yellow-400" />;
      default: return <Package className="w-5 h-5 text-gray-400" />;
    }
  };

  const loadUserData = async () => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setIsAuthenticated(true);
      // Load user data
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'x-user-id': storedUserId,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setCharacter(data.character);
          setEquipment(data.character.equipment || []);

          // Carregar totalStats usando a API de character
          await loadCharacterWithEquipment();

          // Carregar loja e inventário quando usuário já está autenticado
          await loadShopItems();
          await loadInventory();
        } else {
          // Se der erro, remove o userId inválido
          localStorage.removeItem('userId');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Em caso de erro, não bloqueia o acesso
        // Apenas mostra a tela de login
        localStorage.removeItem('userId');
        setIsAuthenticated(false);
      }
    }
  };

  const loadShopItems = async () => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      console.log('[SHOP] Nenhum userId encontrado no localStorage');
      return;
    }

    const cacheBuster = Date.now();
    console.log('[SHOP] Carregando loja para usuário', storedUserId, 'cacheBuster:', cacheBuster);

    try {
      const response = await fetch(`/api/shop?_t=${cacheBuster}`, {
        headers: {
          'x-user-id': storedUserId,
        },
      });

      console.log('[SHOP] Response status:', response.status, response.statusText);
      console.log('[SHOP] Response OK:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('[SHOP] Dados recebidos', JSON.stringify(data, null, 2));
        console.log('[SHOP] Quantidade de itens:', data.shopItems?.length);
        console.log('[SHOP] Itens:', data.shopItems);
        setShopItems(data.shopItems || []);
      } else {
        const errorData = await response.json();
        console.error('[SHOP] Erro ao carregar loja:', response.status, errorData);
      }
    } catch (error) {
      console.error('[SHOP] Error loading shop items:', error);
      console.error('[SHOP] Error stack:', error.stack);
    }
  };

  const loadInventory = async () => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) return;

    try {
      const response = await fetch('/api/inventory', {
        headers: {
          'x-user-id': storedUserId,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventoryItems || []);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadUserData();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Cleanup do intervalo quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (battleIntervalRef.current) {
        clearInterval(battleIntervalRef.current);
        battleIntervalRef.current = null;
      }
    };
  }, []);

  // Atualiza os refs para evitar problemas de closure
  useEffect(() => {
    characterRef.current = character;
  }, [character]);

  useEffect(() => {
    totalStatsRef.current = totalStats;
  }, [totalStats]);

  useEffect(() => {
    enemyRef.current = enemy;
  }, [enemy]);

  // Log para monitorar quando shopItems muda
  useEffect(() => {
    console.log('[SHOP] Estado shopItems atualizado:', {
      length: shopItems.length,
      items: shopItems,
    });
  }, [shopItems]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <Swords className="w-16 h-16 text-orange-500" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Backpack Brawl
              </CardTitle>
              <CardDescription className="text-slate-400">
                {isLogin ? 'Entre para começar sua jornada!' : 'Crie sua conta e comece a lutar!'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLogin ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="bg-slate-900/50 border-slate-700 pl-10 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="bg-slate-900/50 border-slate-700 pl-10 text-white placeholder:text-slate-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                  <p className="text-center text-sm text-slate-400">
                    Não tem conta?{' '}
                    <button
                      onClick={() => setIsLogin(false)}
                      className="text-orange-400 hover:text-orange-300 font-medium"
                    >
                      Cadastre-se
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Nome</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Seu nome de herói"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="bg-slate-900/50 border-slate-700 pl-10 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="bg-slate-900/50 border-slate-700 pl-10 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="bg-slate-900/50 border-slate-700 pl-10 text-white placeholder:text-slate-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {isLoading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                  <p className="text-center text-sm text-slate-400">
                    Já tem conta?{' '}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="text-orange-400 hover:text-orange-300 font-medium"
                    >
                      Entre
                    </button>
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Swords className="w-8 h-8 text-orange-500" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Backpack Brawl
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-white">{user?.coins || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Gem className="w-4 h-4 text-purple-500" />
                <span className="font-semibold text-white">{user?.gems || 0}</span>
              </div>
              <Badge variant="outline" className="border-orange-500 text-orange-400">
                Nível {user?.level || 1}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <User className="w-4 h-4" />
                <span>{user?.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-slate-600 hover:bg-slate-700"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="battle" className="data-[state=active]:bg-orange-500 text-white">
              <Swords className="w-4 h-4 mr-2" />
              Batalha
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-orange-500 text-white">
              <Package className="w-4 h-4 mr-2" />
              Inventário
            </TabsTrigger>
            <TabsTrigger value="shop" className="data-[state=active]:bg-orange-500 text-white">
              <Store className="w-4 h-4 mr-2" />
              Loja
            </TabsTrigger>
            <TabsTrigger value="ranking" className="data-[state=active]:bg-orange-500 text-white">
              <Trophy className="w-4 h-4 mr-2" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-orange-500 text-white">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
          </TabsList>

          {/* Battle Tab */}
          <TabsContent value="battle" className="space-y-6">
            {!enemy ? (
              <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Swords className="w-6 h-6 text-orange-500" />
                    Arena de Batalha
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Encontre um oponente e mostre sua força!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Your Character */}
                    <Card className="border-slate-600 bg-slate-900/50">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">{character?.name || 'Guerreiro'}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-500" />
                            <span className="text-sm text-slate-300">HP</span>
                          </div>
                          <span className="font-semibold text-red-400">
                            {totalStats?.health || character?.health || 100} / {totalStats?.maxHealth || character?.maxHealth || 100}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Swords className="w-5 h-5 text-orange-500" />
                            <span className="text-sm text-slate-300">Ataque</span>
                          </div>
                          <span className="font-semibold text-orange-400">
                            {totalStats?.attack || character?.attack || 10}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-500" />
                            <span className="text-sm text-slate-300">Defesa</span>
                          </div>
                          <span className="font-semibold text-blue-400">
                            {totalStats?.defense || character?.defense || 5}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm text-slate-300">Velocidade</span>
                          </div>
                          <span className="font-semibold text-yellow-400">
                            {totalStats?.speed || character?.speed || 5}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Battle Stats */}
                    <Card className="border-slate-600 bg-slate-900/50">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">Estatísticas de Batalha</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Vitórias</span>
                          <span className="font-semibold text-green-400">
                            {user?.wins || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Derrotas</span>
                          <span className="font-semibold text-red-400">
                            {user?.losses || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Taxa de Vitória</span>
                          <span className="font-semibold text-white">
                            {user?.wins && user?.losses
                              ? Math.round((user.wins / (user.wins + user.losses)) * 100)
                              : 0}%
                          </span>
                        </div>
                        <Separator />
                        <Button
                          onClick={findBattle}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          size="lg"
                        >
                          <Swords className="w-5 h-5 mr-2" />
                          Procurar Batalha
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Swords className="w-6 h-6 text-orange-500" />
                    Batalha em Progresso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Health Bars */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-white">{character?.name}</span>
                        <span className="text-red-400">{playerHealth} HP</span>
                      </div>
                      <Progress
                        value={(playerHealth / (character?.maxHealth || 100)) * 100}
                        className="h-3 bg-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-red-400">{enemy?.name}</span>
                        <span className="text-red-400">{enemyHealth} HP</span>
                      </div>
                      <Progress
                        value={(enemyHealth / (enemy?.maxHealth || 100)) * 100}
                        className="h-3 bg-slate-700"
                      />
                    </div>
                  </div>

                  {/* Battle Log */}
                  <Card className="border-slate-600 bg-slate-900/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-white">Log de Batalha</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48 w-full">
                        <div className="space-y-2">
                          {battleLog.map((log, index) => (
                            <p key={index} className="text-sm text-slate-300">
                              {log}
                            </p>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Battle Status Indicator */}
                  {isInBattle && playerHealth > 0 && enemyHealth > 0 && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500/20 border border-orange-500 rounded-full">
                        <Zap className="w-5 h-5 text-orange-400 animate-pulse" />
                        <span className="text-lg font-semibold text-orange-400">Batalha Automática em Andamento</span>
                      </div>
                    </div>
                  )}

                  {/* Victory/Defeat Messages */}
                  {(!isInBattle || playerHealth <= 0 || enemyHealth <= 0) && (
                    <div className="text-center py-4">
                      {playerHealth <= 0 ? (
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/20 border border-red-500 rounded-full">
                          <span className="text-lg font-semibold text-red-400">💀 Derrota!</span>
                        </div>
                      ) : enemyHealth <= 0 ? (
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500 rounded-full">
                          <span className="text-lg font-semibold text-green-400">🎉 Vitória!</span>
                        </div>
                      ) : enemy && playerHealth > 0 && !isInBattle ? (
                        <Button
                          onClick={startBattle}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          size="lg"
                        >
                          <Zap className="w-5 h-5 mr-2" />
                          Iniciar Batalha Automática!
                        </Button>
                      ) : (
                        <Button
                          onClick={findBattle}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          size="lg"
                        >
                          <Swords className="w-5 h-5 mr-2" />
                          Procurar Batalha
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Package className="w-6 h-6 text-orange-500" />
                  Inventário
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Gerencie seus itens e equipamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Equipment Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-500" />
                    Equipamentos Equipados
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(['WEAPON', 'ARMOR', 'ACCESSORY'] as const).map((slot) => {
                      const equippedItem = getEquippedItem(slot);
                      return (
                        <Card
                          key={slot}
                          className={`border-slate-600 bg-slate-900/50 transition-colors ${
                            equippedItem ? 'border-orange-500' : 'border-slate-700'
                          }`}
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {getSlotIcon(slot)}
                                <div>
                                  <p className="text-xs text-slate-400">{getSlotName(slot)}</p>
                                  {equippedItem ? (
                                    <>
                                      <p className="text-sm font-semibold text-white">{equippedItem.name}</p>
                                      <Badge className={`text-xs ${getRarityColor(equippedItem.rarity)} border-0 bg-transparent`}>
                                        {getRarityName(equippedItem.rarity)}
                                      </Badge>
                                    </>
                                  ) : (
                                    <p className="text-sm text-slate-500">Vazio</p>
                                  )}
                                </div>
                              </div>
                              {equippedItem && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  onClick={() => handleUnequip(slot)}
                                >
                                  ✕
                                </Button>
                              )}
                            </div>
                            {equippedItem && (
                              <div className="space-y-1">
                                {equippedItem.attackBonus > 0 && (
                                  <p className="text-xs text-orange-400">+{equippedItem.attackBonus} Ataque</p>
                                )}
                                {equippedItem.defenseBonus > 0 && (
                                  <p className="text-xs text-blue-400">+{equippedItem.defenseBonus} Defesa</p>
                                )}
                                {equippedItem.healthBonus > 0 && (
                                  <p className="text-xs text-red-400">+{equippedItem.healthBonus} Vida</p>
                                )}
                                {equippedItem.speedBonus > 0 && (
                                  <p className="text-xs text-yellow-400">+{equippedItem.speedBonus} Velocidade</p>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Inventory Section */}
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-500" />
                  Inventário
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {inventory.length === 0 ? (
                    <p className="col-span-full text-center text-slate-400 py-8">
                      Seu inventário está vazio. Vá à loja para comprar itens!
                    </p>
                  ) : (
                    inventory.map((invItem: any) => (
                      <Card key={invItem.id} className="border-slate-600 bg-slate-900/50 hover:border-orange-500 transition-colors">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getItemIcon(invItem.item.type)}
                              <div>
                                <p className="text-sm font-semibold text-white">{invItem.item.name}</p>
                                <Badge className={`text-xs ${getRarityColor(invItem.item.rarity)} border-0 bg-transparent`}>
                                  {getRarityName(invItem.item.rarity)}
                                </Badge>
                                {invItem.quantity > 1 && (
                                  <Badge className="text-xs bg-orange-500 text-white ml-2">
                                    x{invItem.quantity}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {invItem.item.attackBonus > 0 && (
                              <p className="text-xs text-orange-400">+{invItem.item.attackBonus} Ataque</p>
                            )}
                            {invItem.item.defenseBonus > 0 && (
                              <p className="text-xs text-blue-400">+{invItem.item.defenseBonus} Defesa</p>
                            )}
                            {invItem.item.healthBonus > 0 && (
                              <p className="text-xs text-red-400">+{invItem.item.healthBonus} Vida</p>
                            )}
                            {invItem.item.speedBonus > 0 && (
                              <p className="text-xs text-yellow-400">+{invItem.item.speedBonus} Velocidade</p>
                            )}
                          </div>
                          {['WEAPON', 'ARMOR', 'ACCESSORY'].includes(invItem.item.type) && (
                            <Button
                              size="sm"
                              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                              onClick={() => handleEquip(invItem.itemId, invItem.item.type)}
                            >
                              Equipar
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shop Tab */}
          <TabsContent value="shop">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Store className="w-6 h-6 text-orange-500" />
                  Loja
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Compre itens para fortalecer seu personagem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {shopItems.map((item: any, index) => (
                    <Card key={item.id} className="border-slate-600 bg-slate-900/50 hover:border-orange-500 transition-colors">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getItemIcon(item.type)}
                            <div>
                              <p className="text-sm font-semibold text-white">{item.name}</p>
                              <Badge className={`text-xs ${getRarityColor(item.rarity)} border-0 bg-transparent`}>
                                {getRarityName(item.rarity)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {item.attackBonus > 0 && (
                            <p className="text-xs text-orange-400">+{item.attackBonus} Ataque</p>
                          )}
                          {item.defenseBonus > 0 && (
                            <p className="text-xs text-blue-400">+{item.defenseBonus} Defesa</p>
                          )}
                          {item.healthBonus > 0 && (
                            <p className="text-xs text-red-400">+{item.healthBonus} Vida</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-semibold text-yellow-400">{item.basePrice}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                            disabled={(user?.coins || 0) < item.basePrice}
                            onClick={() => handlePurchase(item)}
                          >
                            Comprar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ranking Tab */}
          <TabsContent value="ranking">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Trophy className="w-6 h-6 text-orange-500" />
                  Ranking Global
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Os melhores guerreiros do reino
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: 'Rei Arthur', level: 50, wins: 450, losses: 20 },
                    { rank: 2, name: 'Merlin', level: 45, wins: 420, losses: 35 },
                    { rank: 3, name: 'Lancelot', level: 43, wins: 395, losses: 28 },
                    { rank: 4, name: 'Guerreiro Sombrio', level: 40, wins: 380, losses: 40 },
                    { rank: 5, name: 'Mestre das Espadas', level: 38, wins: 350, losses: 45 },
                    { rank: 6, name: 'Dragão Slayer', level: 35, wins: 320, losses: 50 },
                    { rank: 7, name: 'Campeão Real', level: 33, wins: 300, losses: 55 },
                    { rank: 8, name: 'Guardião da Luz', level: 30, wins: 280, losses: 60 },
                    { rank: 9, name: 'Berserker', level: 28, wins: 260, losses: 65 },
                    { rank: 10, name: 'Cavaleiro Negro', level: 25, wins: 240, losses: 70 },
                  ].map((player) => (
                    <div
                      key={player.rank}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        player.rank <= 3 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20' : 'bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800">
                        {player.rank === 1 ? (
                          <Crown className="w-6 h-6 text-yellow-500" />
                        ) : player.rank === 2 ? (
                          <span className="text-lg font-bold text-slate-400">2</span>
                        ) : player.rank === 3 ? (
                          <span className="text-lg font-bold text-orange-700">3</span>
                        ) : (
                          <span className="text-sm font-semibold text-slate-500">{player.rank}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{player.name}</p>
                        <p className="text-sm text-slate-400">Nível {player.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-400">{player.wins}W</p>
                        <p className="text-sm text-red-400">{player.losses}L</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="w-6 h-6 text-orange-500" />
                  Perfil
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Suas estatísticas e progresso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Character Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Personagem</h3>
                    <Card className="border-slate-600 bg-slate-900/50">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Nome</span>
                          <span className="font-semibold text-white">{character?.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Nível</span>
                          <span className="font-semibold text-orange-400">{character?.level}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">HP</span>
                          <span className="font-semibold text-red-400">{character?.health}/{character?.maxHealth}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Ataque</span>
                          <span className="font-semibold text-orange-400">{character?.attack}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Defesa</span>
                          <span className="font-semibold text-blue-400">{character?.defense}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Velocidade</span>
                          <span className="font-semibold text-yellow-400">{character?.speed}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Progresso</h3>
                    <Card className="border-slate-600 bg-slate-900/50">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Experiência</span>
                          <span className="font-semibold text-purple-400">{user?.experience || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Moedas</span>
                          <div className="flex items-center gap-1">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span className="font-semibold text-yellow-400">{user?.coins || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Gemas</span>
                          <div className="flex items-center gap-1">
                            <Gem className="w-4 h-4 text-purple-500" />
                            <span className="font-semibold text-purple-400">{user?.gems || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <h3 className="text-lg font-semibold text-white pt-2">Histórico de Batalhas</h3>
                    <Card className="border-slate-600 bg-slate-900/50">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Vitórias</span>
                          <span className="font-semibold text-green-400">{user?.wins || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Derrotas</span>
                          <span className="font-semibold text-red-400">{user?.losses || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Total de Batalhas</span>
                          <span className="font-semibold text-white">{(user?.wins || 0) + (user?.losses || 0)}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Taxa de Vitória</span>
                          <span className="font-semibold text-white">
                            {user?.wins && user?.losses
                              ? Math.round((user.wins / (user.wins + user.losses)) * 100)
                              : 0}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-800/50 backdrop-blur mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-slate-400">
            Backpack Brawl © 2024 - Criado com Next.js 16
          </p>
        </div>
      </footer>
    </div>
  );
}
