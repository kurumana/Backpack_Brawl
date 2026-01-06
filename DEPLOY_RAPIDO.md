# 🎮 Jogo de Sobrevivência - Deploy Rápido na Netlify + Supabase

## Resumo Rápido

Este projeto foi migrado de **SQLite** para **Supabase (PostgreSQL)** para funcionar na Netlify.

## 🚀 Passos para Deploy

### 1. Criar projeto no Supabase (5 minutos)

1. Acesse [supabase.com](https://supabase.com) → Crie conta
2. Clique em "New Project" → Preencha nome e senha (guarde a senha!)
3. Aguarde ~2 minutos o projeto ser criado
4. Vá em **Settings > Database**
5. Copie a **Connection string** (formato URI)

### 2. Criar tabelas no Supabase

**Opção rápida (Prisma CLI):**
```bash
# Substitua pela sua URL do Supabase
DATABASE_URL="postgresql://postgres:SUA_SENHA@SEU_PROJETO.supabase.co:5432/postgres"

# Gera o cliente e cria as tabelas
bunx prisma generate
bunx prisma db push
```

### 3. Fazer push no GitHub

```bash
git init
git add .
git commit -m "Migrado para Supabase"
git remote add origin https://github.com/SEU_USUARIO/seu-repo.git
git branch -M main
git push -u origin main
```

### 4. Deploy na Netlify

1. Acesse [netlify.com](https://netlify.com) → Login com GitHub
2. "Add new site" → "Import an existing project"
3. Selecione seu repositório do GitHub
4. **Build settings**:
   - Build command: `bun run build`
   - Publish directory: `.next`
5. **Environment variables**:
   - Key: `DATABASE_URL`
   - Value: Sua URL do Supabase (a mesma do passo 1)
   - Marque "All deploy contexts"
6. Clique em "Deploy site"

Pronto! Em 2-5 minutos seu jogo estará online! 🎉

---

## 📚 Documentação Completa

Veja `DEPLOY_NETLIFY.md` para instruções detalhadas e troubleshooting.

---

## ✅ Checklist Antes do Deploy

- [ ] Projeto Supabase criado e ativo
- [ ] Tabelas criadas no Supabase
- [ ] Código no GitHub
- [ ] `DATABASE_URL` configurada nas variáveis da Netlify
- [ ] Deploy bem-sucedido na Netlify

---

## 🛠️ Se tiver problemas

Verifique:
1. Logs da Netlify (Deploys > deploy mais recente)
2. Variáveis de ambiente na Netlify (Site settings > Environment variables)
3. URL do Supabase correta
4. Tabelas criadas no Supabase

---

## 💰 Custos

- Netlify: **Grátis** (até 100GB/mês)
- Supabase: **Grátis** (até 500MB)
- Total: **R$ 0,00/mês** 🎉
