# Deploy do Jogo de Sobrevivência na Netlify com Supabase

Este guia mostra como configurar e fazer o deploy do jogo de sobrevivência na Netlify usando Supabase como banco de dados PostgreSQL.

## 📋 Pré-requisitos

- Conta no GitHub (para hospedar o código)
- Conta na Netlify (gratuita em [netlify.com](https://netlify.com))
- Conta no Supabase (gratuita em [supabase.com](https://supabase.com))

---

## 🚀 Passo 1: Configurar Supabase

### 1.1 Criar um novo projeto

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login ou crie uma conta
4. Clique em "New Project"
5. Preencha:
   - **Name**: `sobrevivencia-game` (ou outro nome)
   - **Database Password**: Crie uma senha forte e **guarde-a**!
   - **Region**: Escolha a mais próxima do seu público
   - **Pricing Plan**: Free
6. Clique em "Create new project"
7. Aguarde 1-2 minutos enquanto o projeto é criado

### 1.2 Obter a URL de conexão

1. No painel do Supabase, vá em **Settings** > **Database**
2. Encontre a seção **Connection string**
3. Clique em **URI** e copie a string
4. A URL terá este formato:
   ```
   postgresql://postgres:[SENHA]@[PROJETO].supabase.co:5432/postgres
   ```

### 1.3 Criar as tabelas no banco

**Opção A: Usar o Prisma Studio (Recomendado)**

No seu terminal local, execute:

```bash
# Substitua pela sua URL do Supabase
DATABASE_URL="postgresql://postgres:SUA_SENHA@SEU_PROJETO.supabase.co:5432/postgres"

# Gera o cliente Prisma
bunx prisma generate

# Cria as tabelas no Supabase
bunx prisma db push
```

**Opção B: Usar SQL Editor no Supabase**

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Cole este SQL:

```sql
-- Criar tabela Game
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "day" INTEGER NOT NULL DEFAULT 1,
    "health" INTEGER NOT NULL DEFAULT 100,
    "hunger" INTEGER NOT NULL DEFAULT 0,
    "thirst" INTEGER NOT NULL DEFAULT 0,
    "energy" INTEGER NOT NULL DEFAULT 100,
    "score" INTEGER NOT NULL DEFAULT 0,
    "isAlive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- Criar tabela InventoryItem
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InventoryItem_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Criar tabela GameEvent
CREATE TABLE "GameEvent" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GameEvent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "GameEvent_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX "InventoryItem_gameId_idx" ON "InventoryItem"("gameId");
CREATE INDEX "GameEvent_gameId_idx" ON "GameEvent"("gameId");

-- Criar função para updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updatedAt
CREATE TRIGGER update_game_updated_at BEFORE UPDATE ON "Game"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. Clique em **Run** para executar

### 1.4 Configurar permissões de acesso (opcional)

Para permitir que qualquer IP acesse o banco (necessário para Netlify):

1. No painel do Supabase, vá em **Settings** > **Database**
2. Encontre a seção **Connection pooling**
3. Ative **Connection pooling** se desejado (para melhor performance)

---

## 📤 Passo 2: Configurar no GitHub

### 2.1 Criar repositório

1. No seu terminal, inicialize o Git (se ainda não fez):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Survival game with Supabase"
   ```

2. Crie um repositório novo no GitHub (GitHub > New repository)
3. Conecte e push:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/seu-repositorio.git
   git branch -M main
   git push -u origin main
   ```

### 2.2 Criar arquivo netlify.toml

Crie o arquivo `netlify.toml` na raiz do projeto:

```toml
[build]
  command = "bun run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  BUN_VERSION = "1.1.0"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  node_bundler = "esbuild"
```

### 2.3 Atualizar package.json (se necessário)

Certifique-se que o `package.json` tem estes scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate"
  }
}
```

---

## 🌐 Passo 3: Deploy na Netlify

### 3.1 Conectar GitHub com Netlify

1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em **"Add new site"** > **"Import an existing project"**
3. Clique em **"GitHub"** e autorize o acesso
4. Selecione o repositório do seu jogo

### 3.2 Configurar build settings

Preencha os campos:

- **Build command**: `bun run build`
- **Publish directory**: `.next`
- **Base directory**: (deixe vazio)

### 3.3 Configurar variáveis de ambiente

Na seção **Environment variables**, adicione:

1. Clique em **"New variable"**
2. Adicione:
   - **Key**: `DATABASE_URL`
   - **Value**: Sua URL do Supabase (ex: `postgresql://postgres:SUA_SENHA@SEU_PROJETO.supabase.co:5432/postgres`)
   - Marque **"All deploy contexts"**
3. Clique em **Save**

**Importante**: Nunca comite a URL real com a senha no GitHub!

### 3.4 Deploy

1. Clique em **"Deploy site"**
2. Aguarde o build (pode demorar 2-5 minutos na primeira vez)
3. Quando aparecer "Published", clique na URL para testar!

---

## ✅ Passo 4: Testar e Verificar

### 4.1 Verificar se as APIs funcionam

Acesse:
- `https://SEU-SITE.netlify.app/` - Deve mostrar a tela inicial do jogo
- Tente criar uma nova partida e jogar

### 4.2 Verificar logs se tiver erro

1. No painel da Netlify, vá em **Deploys**
2. Clique no deploy mais recente
3. Se tiver erro, clique em **View deploy log**

---

## 🔧 Troubleshooting (Solução de problemas)

### Erro: "Database connection failed"

**Solução**:
- Verifique se a `DATABASE_URL` está correta nas variáveis da Netlify
- Teste a URL localmente antes de fazer o deploy
- Verifique se o projeto Supabase está ativo

### Erro: "Prisma Client not initialized"

**Solução**:
- Certifique-se que o script `postinstall` está no package.json
- Adicione `"postinstall": "prisma generate"` se não estiver
- Re-deploy o projeto

### Erro: "Build failed"

**Solução**:
- Verifique o log de build na Netlify
- Pode ser problema de versão do Node.js - tente mudar para 18 ou 20
- Verifique se todas as dependências estão no package.json

### Erro: "API returns 404"

**Solução**:
- Verifique se o arquivo `netlify.toml` está configurado corretamente
- As rotas devem estar em `src/app/api/`
- Verifique se o Next.js está configurado corretamente

---

## 🔄 Atualizações Futuras

Para atualizar o jogo após o deploy:

1. Faça as mudanças no código local
2. Teste localmente: `bun run dev`
3. Commit e push no GitHub
4. Netlify fará deploy automático!

---

## 💰 Custos

- **Netlify**: Gratuito até 100GB bandwidth/month
- **Supabase**: Gratuito até 500MB de banco
- **GitHub**: Grátis para repositórios públicos
- **Total**: R$ 0,00 por mês!

---

## 📚 Recursos Adicionais

- [Documentação Netlify](https://docs.netlify.com)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação Next.js](https://nextjs.org/docs)

---

## 🎮 Boa sorte com o jogo!

Se precisar de ajuda, verifique:
1. Logs da Netlify (deploy e functions)
2. Logs do Supabase (Database > Logs)
3. Console do navegador (F12) para erros frontend
