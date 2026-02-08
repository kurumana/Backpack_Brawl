'use client';

import { useState, useEffect } from 'react';
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

  // Inventory state
  const [inventory, setInventory] = useState<Item[]>([]);
  const [shopItems, setShopItems] = useState<Item[]>([]);

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
        setIsAuthenticated(true);
        localStorage.setItem('userId', data.user.id);
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
        setIsAuthenticated(true);
        localStorage.setItem('userId', data.user.id);
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

  const startBattle = () => {
    const newEnemy = generateEnemy();
    setEnemy(newEnemy);
    setPlayerHealth(character?.health || 100);
    setEnemyHealth(newEnemy.health);
    setBattleLog([`⚔️ Batalha iniciada contra ${newEnemy.name}!`]);
    setIsInBattle(true);
  };

  const performAttack = async () => {
    if (!character || !enemy) return;

    const playerDamage = Math.max(1, character.attack - enemy.defense + Math.floor(Math.random() * 5));
    const enemyDamage = Math.max(1, enemy.attack - character.defense + Math.floor(Math.random() * 5));

    const newPlayerHealth = Math.max(0, playerHealth - enemyDamage);
    const newEnemyHealth = Math.max(0, enemyHealth - playerDamage);

    setBattleLog((prev) => [
      ...prev,
      `⚔️ Você causou ${playerDamage} de dano!`,
      `🛡️ ${enemy.name} causou ${enemyDamage} de dano em você!`,
    ]);

    setPlayerHealth(newPlayerHealth);
    setEnemyHealth(newEnemyHealth);

    if (newEnemyHealth <= 0) {
      setIsInBattle(false);
      setBattleLog((prev) => [
        ...prev,
        `🎉 Vitória! Você derrotou ${enemy.name}!`,
        `💰 Ganhou ${character.level * 10} moedas!`,
      ]);
      const coinsGained = character.level * 10;
      if (user) {
        setUser({ ...user, coins: user.coins + coinsGained, wins: user.wins + 1 });
      }
    } else if (newPlayerHealth <= 0) {
      setIsInBattle(false);
      setBattleLog((prev) => [
        ...prev,
        `💀 Derrota! Você foi derrotado por ${enemy.name}!`,
      ]);
      if (user) {
        setUser({ ...user, losses: user.losses + 1 });
      }
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
      case 'WEAPON': return <WeaponIcon className="w-4 h-4" />;
      case 'ARMOR': return <ArmorIcon className="w-4 h-4" />;
      case 'ACCESSORY': return <AccessoryIcon className="w-4 h-4" />;
      case 'POTION': return <Sparkles className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  useEffect(() => {
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

    loadUserData();
  }, []);

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
            <TabsTrigger value="battle" className="data-[state=active]:bg-orange-500">
              <Swords className="w-4 h-4 mr-2" />
              Batalha
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-orange-500">
              <Package className="w-4 h-4 mr-2" />
              Inventário
            </TabsTrigger>
            <TabsTrigger value="shop" className="data-[state=active]:bg-orange-500">
              <Store className="w-4 h-4 mr-2" />
              Loja
            </TabsTrigger>
            <TabsTrigger value="ranking" className="data-[state=active]:bg-orange-500">
              <Trophy className="w-4 h-4 mr-2" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-orange-500">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
          </TabsList>

          {/* Battle Tab */}
          <TabsContent value="battle" className="space-y-6">
            {!isInBattle ? (
              <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Swords className="w-6 h-6 text-orange-500" />
                    Arena de Batalha
                  </CardTitle>
                  <CardDescription>
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
                            {character?.health || 100} / {character?.maxHealth || 100}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Swords className="w-5 h-5 text-orange-500" />
                            <span className="text-sm text-slate-300">Ataque</span>
                          </div>
                          <span className="font-semibold text-orange-400">
                            {character?.attack || 10}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-500" />
                            <span className="text-sm text-slate-300">Defesa</span>
                          </div>
                          <span className="font-semibold text-blue-400">
                            {character?.defense || 5}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm text-slate-300">Velocidade</span>
                          </div>
                          <span className="font-semibold text-yellow-400">
                            {character?.speed || 5}
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
                          onClick={startBattle}
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

                  {/* Action Button */}
                  {playerHealth > 0 && enemyHealth > 0 && (
                    <Button
                      onClick={performAttack}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      size="lg"
                    >
                      <Swords className="w-5 h-5 mr-2" />
                      Atacar!
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-6 h-6 text-orange-500" />
                  Inventário
                </CardTitle>
                <CardDescription>
                  Gerencie seus itens e equipamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Espada de Madeira', rarity: 'COMMON', type: 'WEAPON', attackBonus: 5 },
                    { name: 'Armadura de Ferro', rarity: 'UNCOMMON', type: 'ARMOR', defenseBonus: 10, healthBonus: 25 },
                    { name: 'Poção de Vida', rarity: 'COMMON', type: 'POTION', healthBonus: 20 },
                    { name: 'Anel de Sorte', rarity: 'COMMON', type: 'ACCESSORY', speedBonus: 2 },
                    { name: 'Machado de Guerra', rarity: 'UNCOMMON', type: 'WEAPON', attackBonus: 15 },
                    { name: 'Armadura Dragônica', rarity: 'EPIC', type: 'ARMOR', defenseBonus: 25, healthBonus: 60 },
                  ].map((item, index) => (
                    <Card key={index} className="border-slate-600 bg-slate-900/50 hover:border-orange-500 transition-colors">
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
                          {item.speedBonus > 0 && (
                            <p className="text-xs text-yellow-400">+{item.speedBonus} Velocidade</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shop Tab */}
          <TabsContent value="shop">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-6 h-6 text-orange-500" />
                  Loja
                </CardTitle>
                <CardDescription>
                  Compre itens para fortalecer seu personagem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Espada de Ferro', rarity: 'COMMON', type: 'WEAPON', attackBonus: 10, price: 25 },
                    { name: 'Armadura de Aço', rarity: 'UNCOMMON', type: 'ARMOR', defenseBonus: 12, healthBonus: 30, price: 90 },
                    { name: 'Poção de Vida Média', rarity: 'UNCOMMON', type: 'POTION', healthBonus: 40, price: 25 },
                    { name: 'Anel de Proteção', rarity: 'UNCOMMON', type: 'ACCESSORY', defenseBonus: 5, price: 40 },
                    { name: 'Lâmina Sombria', rarity: 'RARE', type: 'WEAPON', attackBonus: 25, price: 150 },
                    { name: 'Armadura de Placas', rarity: 'RARE', type: 'ARMOR', defenseBonus: 18, healthBonus: 45, price: 180 },
                  ].map((item, index) => (
                    <Card key={index} className="border-slate-600 bg-slate-900/50 hover:border-orange-500 transition-colors">
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
                            <span className="text-sm font-semibold text-yellow-400">{item.price}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                            disabled={(user?.coins || 0) < item.price}
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
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-orange-500" />
                  Ranking Global
                </CardTitle>
                <CardDescription>
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
                <CardTitle className="flex items-center gap-2">
                  <User className="w-6 h-6 text-orange-500" />
                  Perfil
                </CardTitle>
                <CardDescription>
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
