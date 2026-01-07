'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Folder,
  Plus,
  LayoutDashboard,
  Kanban,
  Settings,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Circle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

// Tipos de dados
interface User {
  id: number
  name: string
  email: string
  avatar: string
  role: 'admin' | 'manager' | 'member'
}

interface Priority {
  id: number
  name: string
  value: number
  color: string
  icon: string
}

interface Column {
  id: number
  name: string
  position: number
  color: string
  tasks: Task[]
}

interface Task {
  id: number
  project_id: number
  column_id: number
  title: string
  description: string
  priority_id: number
  assigned_to: number | null
  status: string
  position: number
  due_date: string | null
  created_at: string
  tags?: string[]
  comments?: number
}

interface Project {
  id: number
  name: string
  description: string
  color: string
  icon: string
  owner_id: number
  status: string
  start_date: string
  end_date: string
  members: number
  total_tasks: number
  completed_tasks: number
}

// Dados simulados (mock data)
const mockUsers: User[] = [
  { id: 1, name: 'Administrador', email: 'admin@projeto.com', avatar: 'A', role: 'admin' },
  { id: 2, name: 'João Silva', email: 'joao@exemplo.com', avatar: 'J', role: 'manager' },
  { id: 3, name: 'Maria Santos', email: 'maria@exemplo.com', avatar: 'M', role: 'member' },
  { id: 4, name: 'Pedro Costa', email: 'pedro@exemplo.com', avatar: 'P', role: 'member' },
]

const mockPriorities: Priority[] = [
  { id: 1, name: 'Baixa', value: 1, color: '#22c55e', icon: 'arrow-down' },
  { id: 2, name: 'Média', value: 2, color: '#eab308', icon: 'minus' },
  { id: 3, name: 'Alta', value: 3, color: '#f97316', icon: 'arrow-up' },
  { id: 4, name: 'Urgente', value: 4, color: '#ef4444', icon: 'alert-circle' },
]

const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Lançamento do Site',
    description: 'Desenvolvimento e lançamento do novo site corporativo',
    color: '#6366f1',
    icon: 'folder',
    owner_id: 1,
    status: 'active',
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    members: 3,
    total_tasks: 5,
    completed_tasks: 1,
  },
  {
    id: 2,
    name: 'App Mobile',
    description: 'Desenvolvimento do aplicativo mobile',
    color: '#8b5cf6',
    icon: 'smartphone',
    owner_id: 1,
    status: 'active',
    start_date: '2024-01-01',
    end_date: '2024-03-01',
    members: 3,
    total_tasks: 4,
    completed_tasks: 1,
  },
  {
    id: 3,
    name: 'Marketing Q1',
    description: 'Campanha de marketing do primeiro trimestre',
    color: '#f59e0b',
    icon: 'megaphone',
    owner_id: 2,
    status: 'active',
    start_date: '2024-01-01',
    end_date: '2024-04-01',
    members: 2,
    total_tasks: 3,
    completed_tasks: 1,
  },
]

const mockColumns: Column[] = [
  {
    id: 1,
    name: 'A Fazer',
    position: 0,
    color: '#f3f4f6',
    tasks: [
      {
        id: 3,
        project_id: 1,
        column_id: 1,
        title: 'Implementar homepage',
        description: 'Desenvolver a página inicial',
        priority_id: 2,
        assigned_to: 2,
        status: 'todo',
        position: 0,
        due_date: '2024-01-15',
        created_at: '2024-01-01',
        tags: ['Frontend', 'Design'],
        comments: 2,
      },
      {
        id: 4,
        project_id: 1,
        column_id: 1,
        title: 'Criar componentes',
        description: 'Desenvolver componentes reutilizáveis',
        priority_id: 2,
        assigned_to: 2,
        status: 'todo',
        position: 1,
        due_date: '2024-01-18',
        created_at: '2024-01-02',
        tags: ['Frontend'],
        comments: 0,
      },
    ],
  },
  {
    id: 2,
    name: 'Em Andamento',
    position: 1,
    color: '#dbeafe',
    tasks: [
      {
        id: 1,
        project_id: 1,
        column_id: 2,
        title: 'Criar wireframes',
        description: 'Desenhar wireframes de todas as páginas principais',
        priority_id: 2,
        assigned_to: 2,
        status: 'in_progress',
        position: 0,
        due_date: '2024-01-10',
        created_at: '2024-01-01',
        tags: ['Design'],
        comments: 3,
      },
      {
        id: 2,
        project_id: 1,
        column_id: 2,
        title: 'Configurar servidor',
        description: 'Setup do servidor de produção',
        priority_id: 3,
        assigned_to: 3,
        status: 'in_progress',
        position: 1,
        due_date: '2024-01-12',
        created_at: '2024-01-01',
        tags: ['Backend'],
        comments: 1,
      },
    ],
  },
  {
    id: 3,
    name: 'Revisão',
    position: 2,
    color: '#fef3c7',
    tasks: [
      {
        id: 5,
        project_id: 1,
        column_id: 3,
        title: 'Revisar design',
        description: 'Aprovação final do design',
        priority_id: 2,
        assigned_to: 1,
        status: 'review',
        position: 0,
        due_date: '2024-01-14',
        created_at: '2024-01-01',
        tags: ['Design'],
        comments: 0,
      },
    ],
  },
  {
    id: 4,
    name: 'Concluído',
    position: 3,
    color: '#d1fae5',
    tasks: [],
  },
]

// Componentes auxiliares
const PriorityIcon = ({ priority }: { priority: number }) => {
  switch (priority) {
    case 1:
      return <ArrowDown className="w-3 h-3" />
    case 2:
      return <Minus className="w-3 h-3" />
    case 3:
      return <ArrowUp className="w-3 h-3" />
    case 4:
      return <AlertCircle className="w-3 h-3" />
    default:
      return <Circle className="w-3 h-3" />
  }
}

const TaskCard = ({ task, onTaskClick }: { task: Task; onTaskClick: (task: Task) => void }) => {
  const priority = mockPriorities.find(p => p.id === task.priority_id)
  const assignedUser = mockUsers.find(u => u.id === task.assigned_to)
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'

  return (
    <div
      onClick={() => onTaskClick(task)}
      className="bg-white rounded-lg shadow-sm border p-3 cursor-pointer hover:shadow-md transition-shadow mb-2"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-gray-900 flex-1">{task.title}</h4>
        <Badge
          variant="secondary"
          className="text-xs flex items-center gap-1"
          style={{ backgroundColor: `${priority?.color}20`, color: priority?.color }}
        >
          <PriorityIcon priority={task.priority_id} />
          {priority?.name}
        </Badge>
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-xs border-gray-200">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {assignedUser && (
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                {assignedUser.avatar}
              </AvatarFallback>
            </Avatar>
          )}
          {task.due_date && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
              <Calendar className="w-3 h-3" />
              {new Date(task.due_date).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
        {task.comments !== undefined && task.comments > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>{task.comments}</span>
          </div>
        )}
      </div>
    </div>
  )
}

const ProjectCard = ({ project, onClick }: { project: Project; onClick: (project: Project) => void }) => {
  const completionRate = project.total_tasks > 0
    ? (project.completed_tasks / project.total_tasks) * 100
    : 0

  return (
    <Card
      onClick={() => onClick(project)}
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
      style={{ borderLeftColor: project.color }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5" style={{ color: project.color }} />
            <CardTitle className="text-base">{project.name}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {project.total_tasks} tarefas
          </Badge>
        </div>
        <CardDescription className="text-xs line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{project.members} membros</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>{project.completed_tasks}/{project.total_tasks}</span>
            </div>
          </div>

          <Progress value={completionRate} className="h-2" />

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(project.start_date).toLocaleDateString('pt-BR')} - {new Date(project.end_date).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente principal
export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setActiveTab('kanban')
  }

  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task)
    // TODO: Abrir modal de detalhes da tarefa
  }

  const stats = {
    totalProjects: mockProjects.length,
    totalTasks: mockProjects.reduce((sum, p) => sum + p.total_tasks, 0),
    completedTasks: mockProjects.reduce((sum, p) => sum + p.completed_tasks, 0),
    totalMembers: 4,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Project Manager</h1>
                <p className="text-xs text-gray-500">Gerenciamento de Projetos</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar tarefas, projetos..."
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Avatar className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600">
                <AvatarFallback className="text-white font-medium">A</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white border">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                <Folder className="w-4 h-4 mr-2" />
                Projetos
              </TabsTrigger>
              {selectedProject && (
                <TabsTrigger value="kanban" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                  <Kanban className="w-4 h-4 mr-2" />
                  {selectedProject.name}
                </TabsTrigger>
              )}
            </TabsList>

            <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Total de Projetos</CardDescription>
                  <CardTitle className="text-2xl">{stats.totalProjects}</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Total de Tarefas</CardDescription>
                  <CardTitle className="text-2xl">{stats.totalTasks}</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Tarefas Concluídas</CardDescription>
                  <CardTitle className="text-2xl text-green-600">{stats.completedTasks}</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Membros da Equipe</CardDescription>
                  <CardTitle className="text-2xl">{stats.totalMembers}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Recent Projects */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Projetos Recentes</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} onClick={handleProjectClick} />
                ))}
              </div>
            </div>

            {/* My Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Minhas Tarefas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {mockColumns.flatMap(col => col.tasks)
                        .filter(task => task.assigned_to === 2)
                        .slice(0, 5)
                        .map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleTaskClick(task)}
                            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium">{task.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                              </div>
                              <Badge
                                variant="secondary"
                                className="text-xs"
                                style={{ backgroundColor: `${mockPriorities.find(p => p.id === task.priority_id)?.color}20` }}
                              >
                                {mockPriorities.find(p => p.id === task.priority_id)?.name}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Atividades Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {[
                        { user: 'Maria', action: 'comentou em', target: 'Criar wireframes', time: '5 min atrás' },
                        { user: 'João', action: 'moveu para Em Andamento', target: 'Configurar servidor', time: '10 min atrás' },
                        { user: 'Pedro', action: 'concluiu', target: 'Setup do projeto', time: '1 hora atrás' },
                        { user: 'Maria', action: 'criou', target: 'Implementar homepage', time: '2 horas atrás' },
                      ].map((activity, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                              {activity.user[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">{activity.user}</span> {action}{' '}
                              <span className="font-medium">{target}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onClick={handleProjectClick} />
              ))}
            </div>
          </TabsContent>

          {/* Kanban Tab */}
          <TabsContent value="kanban" className="space-y-6">
            {selectedProject && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Folder className="w-6 h-6" style={{ color: selectedProject.color }} />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedProject.name}</h2>
                      <p className="text-sm text-gray-500">{selectedProject.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      <Users className="w-3 h-3 mr-1" />
                      {selectedProject.members} membros
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurar
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {mockColumns.map((column) => (
                    <div
                      key={column.id}
                      className="rounded-lg p-3"
                      style={{ backgroundColor: column.color }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm">{column.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {column.tasks.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {column.tasks.map((task) => (
                          <TaskCard key={task.id} task={task} onTaskClick={handleTaskClick} />
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-sm text-gray-600 hover:text-gray-900"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar tarefa
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; 2024 Project Manager. Sistema de Gerenciamento de Projetos.</p>
        </div>
      </footer>
    </div>
  )
}
