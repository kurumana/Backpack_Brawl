'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skull, Heart, Droplet, Zap, Activity, Package, LogOut, Play, RefreshCw } from 'lucide-react'

type GameState = {
  id: string
  playerName: string
  day: number
  health: number
  hunger: number
  thirst: number
  energy: number
  score: number
  isAlive: boolean
  inventory: Array<{ itemType: string; quantity: number }>
  events: Array<{ day: number; action: string; result: string }>
}

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  // Carregar jogo salvo ao montar
  useEffect(() => {
    loadSavedGame()
  }, [])

  const loadSavedGame = async () => {
    const savedGameId = localStorage.getItem('survival_game_id')
    if (savedGameId) {
      try {
        const res = await fetch(`/api/game/load?gameId=${savedGameId}`)
        if (res.ok) {
          const data = await res.json()
          setGameState(data)
          setGameStarted(true)
        }
      } catch (error) {
        console.error('Erro ao carregar jogo:', error)
      }
    }
  }

  const startNewGame = async () => {
    if (!playerName.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/game/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName })
      })
      if (res.ok) {
        const data = await res.json()
        setGameState(data)
        setGameStarted(true)
        localStorage.setItem('survival_game_id', data.id)
      }
    } catch (error) {
      console.error('Erro ao criar jogo:', error)
    } finally {
      setLoading(false)
    }
  }

  const performAction = async (action: string) => {
    if (!gameState || !gameState.isAlive) return

    setLoading(true)
    setSelectedAction(action)
    try {
      const res = await fetch('/api/game/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: gameState.id,
          action
        })
      })
      if (res.ok) {
        const data = await res.json()
        setGameState(data)
      }
    } catch (error) {
      console.error('Erro ao executar ação:', error)
    } finally {
      setLoading(false)
      setSelectedAction(null)
    }
  }

  const resetGame = () => {
    localStorage.removeItem('survival_game_id')
    setGameStarted(false)
    setGameState(null)
    setPlayerName('')
  }

  // Tela inicial
  if (!gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-amber-700 dark:text-amber-400 mb-2">
              🏕️ Sobrevivência
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              Sobreviva o máximo de dias possível!
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium mb-2">
                Nome do Jogador
              </label>
              <Input
                id="playerName"
                placeholder="Digite seu nome..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && startNewGame()}
                disabled={loading}
              />
            </div>
            <Button
              onClick={startNewGame}
              disabled={!playerName.trim() || loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              {loading ? 'Criando...' : 'Começar Nova Partida'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Tela de jogo
  if (!gameState || !gameState.isAlive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-orange-50 dark:from-red-950 dark:to-gray-900 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Skull className="w-20 h-20 mx-auto text-red-600 mb-4" />
            <CardTitle className="text-3xl text-red-700 dark:text-red-400">
              Fim de Jogo!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-lg">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>{gameState?.playerName}</strong>
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {gameState?.score} pontos
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Sobreviveu por {gameState?.day} dias
              </p>
            </div>
            <Button
              onClick={resetGame}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              size="lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Jogar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-amber-800 dark:text-amber-400">
              🏕️ Sobrevivência
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Dia {gameState.day}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Activity className="w-4 h-4 mr-1" />
              {gameState.score} pts
            </Badge>
            <Button
              onClick={resetGame}
              variant="outline"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {gameState.playerName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vida */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="font-medium">Vida</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {gameState.health}/100
                </span>
              </div>
              <Progress
                value={gameState.health}
                className="h-3"
              />
            </div>

            {/* Fome */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🍖</span>
                  <span className="font-medium">Fome</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {gameState.hunger}/100
                </span>
              </div>
              <Progress
                value={gameState.hunger}
                className="h-3"
              />
            </div>

            {/* Sede */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Sede</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {gameState.thirst}/100
                </span>
              </div>
              <Progress
                value={gameState.thirst}
                className="h-3"
              />
            </div>

            {/* Energia */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">Energia</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {gameState.energy}/100
                </span>
              </div>
              <Progress
                value={gameState.energy}
                className="h-3"
              />
            </div>
          </CardContent>
        </Card>

        {/* Ações e Inventário */}
        <Tabs defaultValue="actions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="actions">Ações</TabsTrigger>
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
          </TabsList>

          <TabsContent value="actions">
            <Card>
              <CardHeader>
                <CardTitle>O que você vai fazer hoje?</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button
                  onClick={() => performAction('explorar')}
                  disabled={loading}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">🗺️ Explorar</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Buscar recursos e descobrir novos locais
                    </span>
                  </div>
                </Button>

                <Button
                  onClick={() => performAction('cacar')}
                  disabled={loading}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">🏹 Caçar</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Procurar alimentos na floresta (gasta energia)
                    </span>
                  </div>
                </Button>

                <Button
                  onClick={() => performAction('coletar')}
                  disabled={loading}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">🌿 Coletar</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Recolher frutas e plantas (gasta pouca energia)
                    </span>
                  </div>
                </Button>

                <Button
                  onClick={() => performAction('descansar')}
                  disabled={loading}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">😴 Descansar</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Recuperar energia e vida
                    </span>
                  </div>
                </Button>

                <Button
                  onClick={() => performAction('construir')}
                  disabled={loading}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">🏠 Construir</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Criar ferramentas e abrigo (gasta recursos)
                    </span>
                  </div>
                </Button>

                {loading && (
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400 animate-pulse">
                    Processando {selectedAction}...
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Inventário
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gameState.inventory.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Inventário vazio. Vá explorar para encontrar recursos!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {gameState.inventory.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getItemEmoji(item.itemType)}
                          </span>
                          <span className="font-medium capitalize">
                            {item.itemType}
                          </span>
                        </div>
                        <Badge variant="secondary">
                          {item.quantity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Eventos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Registro de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {gameState.events.slice().reverse().map((event, index) => (
                <div
                  key={index}
                  className="p-3 bg-amber-50 dark:bg-gray-800 rounded-lg border-l-4 border-amber-500"
                >
                  <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 font-medium mb-1">
                    <Activity className="w-4 h-4" />
                    Dia {event.day}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {event.result}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getItemEmoji(itemType: string): string {
  const emojis: Record<string, string> = {
    madeira: '🪵',
    pedra: '🪨',
    comida: '🍖',
    agua: '💧',
    frutas: '🍎',
    ferramenta: '🔧',
    abrigo: '🏠',
    faca: '🔪',
    corda: '🪢',
    fogo: '🔥',
  }
  return emojis[itemType] || '📦'
}
