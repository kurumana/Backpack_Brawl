# 📊 Project Manager - Sistema de Gerenciamento de Projetos

Sistema completo de gerenciamento de projetos estilo Monday.com, desenvolvido com interface moderna e pronta para deploy em PHP na Hostinger Premium.

## 🎯 Visão Geral

Este projeto é um **protótipo funcional completo** de um sistema de gerenciamento de projetos com interface moderna estilo Monday.com. O protótipo está desenvolvido em Next.js para visualização e teste, mas vem com **documentação completa** para implementação em PHP + MySQL na Hostinger Premium.

## ✨ Features Implementadas

### 📈 Dashboard Principal
- **Estatísticas em tempo real**: Total de projetos, tarefas, conclusões e membros da equipe
- **Cards de projetos recentes**: Visualização rápida com progresso e metadados
- **Minhas tarefas**: Lista personalizada de tarefas atribuídas ao usuário
- **Atividades recentes**: Timeline de ações na equipe

### 📁 Gestão de Projetos
- **Criar projetos** com nome, descrição, cor e datas
- **Visualizar projetos** com cards informativos
- **Progresso automático** baseado nas tarefas concluídas
- **Membros do projeto** com papéis e permissões

### 📋 Kanban Board
- **4 colunas padrão**: A Fazer, Em Andamento, Revisão, Concluído
- **Cards de tarefas** com informações detalhadas
- **Prioridades** com indicadores visuais (Baixa, Média, Alta, Urgente)
- **Tags** para categorização
- **Atribuição de usuários** com avatares
- **Prazos** com alertas de atraso
- **Contador de comentários**

### 👥 Gestão de Equipe
- **Perfis de usuários** com avatares
- **Papéis e permissões** (Admin, Manager, Member)
- **Atribuição de tarefas** para membros

## 🗄️ Banco de Dados

Schema completo MySQL com 11 tabelas:

- `users` - Usuários e equipe
- `projects` - Projetos
- `project_members` - Membros de projetos
- `columns` - Colunas do Kanban
- `tasks` - Tarefas
- `priorities` - Prioridades (Baixa, Média, Alta, Urgente)
- `tags` - Tags de categorização
- `task_tags` - Associação tarefa-tag
- `comments` - Comentários em tarefas
- `attachments` - Anexos de arquivos
- `activity_log` - Histórico de atividades
- `notifications` - Notificações

**Views e Stored Procedures incluídas:**
- `project_stats` - Estatísticas do projeto
- `task_details` - Detalhes completos das tarefas
- `reorder_tasks()` - Reordenar tarefas
- `complete_task()` - Marcar tarefa como concluída

## 🚀 Como Usar

### 1. Visualizar Protótipo (Next.js)

O protótipo está rodando e você pode visualizá-lo em:
```
http://localhost:3000
```

**Features disponíveis no protótipo:**
- ✅ Dashboard com estatísticas
- ✅ Lista de projetos
- ✅ Kanban Board funcional
- ✅ Cards de tarefas com detalhes
- ✅ Navegação entre seções
- ✅ Interface responsiva
- ✅ Design moderno estilo Monday.com

### 2. Implementar em PHP na Hostinger

Para deploy na Hostinger Premium, siga a documentação completa:

**📄 Guia Completo:** [`docs/PHP_IMPLEMENTATION.md`](docs/PHP_IMPLEMENTATION.md)

**📄 Schema SQL:** [`database/schema.sql`](database/schema.sql)

**O guia inclui:**
- ✅ Estrutura completa de arquivos PHP
- ✅ API REST endpoints (Autenticação, Projetos, Tarefas, Colunas, Usuários)
- ✅ Código PHP pronto para uso
- ✅ Integração do frontend JavaScript
- ✅ Configuração de banco de dados MySQL
- ✅ Deploy passo a passo na Hostinger
- ✅ Checklist de verificação
- ✅ Práticas de segurança

## 📁 Estrutura do Projeto

```
project-manager/
├── src/
│   └── app/
│       └── page.tsx              # Protótipo Next.js (Interface completa)
├── database/
│   └── schema.sql                # Schema MySQL completo (11 tabelas)
├── docs/
│   └── PHP_IMPLEMENTATION.md     # Guia completo para implementação PHP
├── prisma/
│   └── schema.prisma             # Schema Prisma (para desenvolvimento local)
└── README.md                     # Este arquivo
```

## 🔌 API PHP Endpoints (Documentados)

### Autenticação
- `POST /api/auth/login.php` - Login do usuário
- `POST /api/auth/register.php` - Registrar novo usuário
- `POST /api/auth/logout.php` - Logout

### Projetos
- `GET /api/projects/index.php` - Listar projetos
- `POST /api/projects/create.php` - Criar projeto
- `PUT /api/projects/update.php` - Atualizar projeto
- `DELETE /api/projects/delete.php` - Deletar projeto
- `GET /api/projects/members.php` - Listar membros do projeto

### Tarefas
- `GET /api/tasks/index.php` - Listar tarefas
- `POST /api/tasks/create.php` - Criar tarefa
- `PUT /api/tasks/update.php` - Atualizar tarefa
- `DELETE /api/tasks/delete.php` - Deletar tarefa
- `POST /api/tasks/move.php` - Mover tarefa entre colunas

### Colunas
- `GET /api/columns/index.php` - Listar colunas de um projeto

### Usuários
- `GET /api/users/index.php` - Listar usuários

### Comentários
- `GET /api/comments/index.php` - Listar comentários
- `POST /api/comments/create.php` - Criar comentário

## 🎨 Stack Tecnológica

### Protótipo (Visualização)
- **Frontend**: Next.js 15 + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Ícones**: Lucide React
- **Estado**: React Hooks

### Implementação PHP (Produção na Hostinger)
- **Backend**: PHP 8.1+
- **Banco de Dados**: MySQL
- **API**: REST (JSON)
- **Autenticação**: JWT (JSON Web Tokens)
- **Frontend**: HTML/CSS/JavaScript Vanilla

## 🚀 Deploy na Hostinger

### Requisitos
- Hostinger Premium Web Hosting
- PHP 8.1 ou superior
- MySQL Database

### Passos Rápidos

1. **Criar banco de dados** no painel Hostinger
2. **Importar schema.sql** via phpMyAdmin
3. **Copiar arquivos PHP** seguindo a estrutura documentada
4. **Configurar credenciais** em `config/database.php`
5. **Upload via FTP** para `public_html`
6. **Testar acesso** ao sistema

**📖 Guia detalhado:** Consulte [`docs/PHP_IMPLEMENTATION.md`](docs/PHP_IMPLEMENTATION.md)

## 🔒 Segurança

### Implementada no Schema SQL
- ✅ Password hashing com bcrypt
- ✅ Foreign keys com ON DELETE CASCADE
- ✅ Índices otimizados para performance
- ✅ Campos DATETIME para rastreamento

### Implementada no Código PHP (no guia)
- ✅ Prepared statements contra SQL injection
- ✅ Validação e sanitização de inputs
- ✅ Autenticação JWT
- ✅ Rate limiting
- ✅ Proteção de uploads
- ✅ HTTPS obrigatório

## 📊 Schema MySQL Destaques

### Tabelas Principais

**projects**
- Relacionamento com usuários (owner)
- Status (active, archived, completed)
- Datas de início e fim
- Cores e ícones personalizados

**tasks**
- Sistema de prioridades (4 níveis)
- Atribuição de usuários
- Prazos e datas
- Posição para ordenação
- Tags flexíveis

**columns**
- Sistema Kanban personalizável
- Cores por coluna
- Ordenação por posição

**activity_log**
- Histórico completo de ações
- Rastreamento de mudanças
- Audit trail

## 🎓 Próximos Passos

Funcionalidades que podem ser adicionadas:

1. **Drag & Drop** - Arrastar e soltar tarefas entre colunas
2. **Filtros Avançados** - Por data, atribuição, tags, prioridade
3. **Gráficos e Relatórios** - Burnup, Burndown, Gantt
4. **Notificações em Tempo Real** - WebSocket
5. **Anexos de Arquivos** - Upload e gestão
6. **Calendário** - Visualização por datas
7. **Busca Global** - Full-text search
8. **Integrações** - Slack, Email, Google Calendar

## 📚 Documentação

- **📘 Guia PHP Completo**: [`docs/PHP_IMPLEMENTATION.md`](docs/PHP_IMPLEMENTATION.md)
- **🗄️ Schema MySQL**: [`database/schema.sql`](database/schema.sql)

## ✅ Checklist de Implementação

### Para Deploy na Hostinger:

- [ ] Ler o guia completo em `docs/PHP_IMPLEMENTATION.md`
- [ ] Criar banco de dados MySQL na Hostinger
- [ ] Importar `database/schema.sql`
- [ ] Implementar API endpoints PHP
- [ ] Adaptar frontend JavaScript
- [ ] Configurar autenticação JWT
- [ ] Upload via FTP
- [ ] Configurar .htaccess
- [ ] Testar todas as funcionalidades
- [ ] Configurar HTTPS
- [ ] Implementar sistema de backups
- [ ] Testar em dispositivos móveis

## 💡 Dicas de Uso

### Durante Desenvolvimento
- Use o protótipo Next.js para validar UX/UI
- Teste as interações antes de implementar em PHP
- Adapte os componentes do protótipo para HTML/CSS

### Para Hostinger
- Mantenha o banco de dados atualizado
- Implemente backups automáticos
- Monitore performance regularmente
- Use HTTPS em produção

## 🤝 Suporte

Este projeto inclui:
- ✅ Protótipo funcional em Next.js
- ✅ Schema MySQL completo
- ✅ Documentação detalhada para PHP
- ✅ Exemplos de código pronto para uso

## 📄 Licença

Este projeto foi desenvolvido como um sistema de gerenciamento de projetos completo, pronto para implementação em PHP na Hostinger Premium.

---

**Desenvolvido com ❤️ para simplificar a gestão de projetos.**

**Versão**: 1.0
**Data**: 2024-01-01
