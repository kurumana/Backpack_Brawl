# Guia de Implementação PHP para Hostinger Premium

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
4. [API REST Endpoints](#api-rest-endpoints)
5. [Integração do Frontend](#integração-do-frontend)
6. [Deploy na Hostinger](#deploy-na-hostinger)
7. [Segurança](#segurança)

---

## 🎯 Visão Geral

Este guia mostra como transformar o protótipo Next.js em uma aplicação PHP completa para deploy na Hostinger Premium.

**Stack:**
- Backend: PHP 8.1+
- Banco de Dados: MySQL
- Frontend: HTML/CSS/JS (pode usar o código do protótipo)
- Autenticação: JWT (JSON Web Tokens)

---

## 📁 Estrutura de Arquivos

```
project-manager/
├── public/                      # Arquivos públicos
│   ├── index.php               # Página principal
│   ├── assets/                 # CSS, JS, imagens
│   └── uploads/                # Arquivos upload
├── api/                        # API REST
│   ├── index.php              # Router principal
│   ├── auth/
│   │   ├── login.php
│   │   ├── register.php
│   │   └── logout.php
│   ├── projects/
│   │   ├── index.php          # Listar projetos
│   │   ├── create.php         # Criar projeto
│   │   ├── update.php         # Atualizar projeto
│   │   ├── delete.php         # Deletar projeto
│   │   └── members.php        # Gerenciar membros
│   ├── tasks/
│   │   ├── index.php          # Listar tarefas
│   │   ├── create.php
│   │   ├── update.php
│   │   ├── delete.php
│   │   └── move.php           # Mover entre colunas
│   ├── columns/
│   │   └── index.php          # Listar colunas
│   ├── users/
│   │   └── index.php          # Listar usuários
│   └── comments/
│       ├── index.php
│       └── create.php
├── config/
│   ├── database.php           # Conexão MySQL
│   └── config.php             # Configurações gerais
├── includes/
│   ├── functions.php          # Funções auxiliares
│   ├── auth.php               # Verificação de autenticação
│   └── cors.php               # CORS headers
├── .htaccess                  # Configuração Apache
└── composer.json              # Dependências PHP
```

---

## 🗄️ Configuração do Banco de Dados

### 1. Criar Banco de Dados na Hostinger

Acesse o painel da Hostinger → MySQL Databases → Create Database

```
Nome: projeto_manager
Usuário: projeto_admin
Senha: [sua senha forte]
```

### 2. Importar Schema SQL

No painel phpMyAdmin, importe o arquivo `database/schema.sql` que está no protótipo.

### 3. Configurar Conexão PHP

**Arquivo:** `config/database.php`

```php
<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'projeto_manager';
    private $username = 'projeto_admin';
    private $password = 'sua_senha_aqui';
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            echo "Connection error: " . $e->getMessage();
        }

        return $this->conn;
    }
}
?>
```

### 4. Configurações Gerais

**Arquivo:** `config/config.php`

```php
<?php
// Configurações básicas
define('BASE_URL', 'https://seu-dominio.com.br');
define('JWT_SECRET', 'sua_chave_secreta_jwt_muito_longa_e_segura');

// Configurações de Upload
define('UPLOAD_PATH', __DIR__ . '/../public/uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB

// Configurações de CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Response JSON
header('Content-Type: application/json; charset=utf-8');
?>
```

---

## 🔌 API REST Endpoints

### Estrutura de Resposta

Todas as respostas seguem este formato:

```json
{
  "success": true|false,
  "data": {},
  "message": "Mensagem de erro (opcional)",
  "errors": []
}
```

### Autenticação

#### POST `/api/auth/login.php`

**Request:**
```json
{
  "email": "admin@projeto.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Administrador",
      "email": "admin@projeto.com",
      "role": "admin"
    }
  }
}
```

**Implementação:**
```php
<?php
require_once '../../config/database.php';
require_once '../../config/config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT id, name, email, password, role FROM users WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $data->email);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row && password_verify($data->password, $row['password'])) {
        unset($row['password']);

        // Gerar JWT token
        $token = base64_encode(json_encode([
            'user_id' => $row['id'],
            'exp' => time() + (60 * 60 * 24) // 24 horas
        ]));

        echo json_encode([
            'success' => true,
            'data' => [
                'token' => $token,
                'user' => $row
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Credenciais inválidas'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Dados incompletos'
    ]);
}
?>
```

---

### Projetos

#### GET `/api/projects/index.php` - Listar Projetos

```php
<?php
require_once '../config/database.php';
require_once '../includes/auth.php';

// Verificar autenticação
$user = authenticate();
if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$query = "SELECT p.*,
         (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) as member_count,
         (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
         (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'done') as completed_tasks
         FROM projects p
         WHERE p.status = 'active'
         ORDER BY p.created_at DESC";

$stmt = $db->prepare($query);
$stmt->execute();

$projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'success' => true,
    'data' => $projects
]);
?>
```

#### POST `/api/projects/create.php` - Criar Projeto

**Request:**
```json
{
  "name": "Novo Projeto",
  "description": "Descrição do projeto",
  "color": "#6366f1",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```

```php
<?php
require_once '../config/database.php';
require_once '../includes/auth.php';

$user = authenticate();
if (!$user || $user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Sem permissão']);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->getConnection();

$query = "INSERT INTO projects SET
          name = :name,
          description = :description,
          color = :color,
          owner_id = :owner_id,
          start_date = :start_date,
          end_date = :end_date";

$stmt = $db->prepare($query);

$stmt->bindParam(':name', $data->name);
$stmt->bindParam(':description', $data->description);
$stmt->bindParam(':color', $data->color);
$stmt->bindParam(':owner_id', $user['id']);
$stmt->bindParam(':start_date', $data->start_date);
$stmt->bindParam(':end_date', $data->end_date);

if ($stmt->execute()) {
    $project_id = $db->lastInsertId();

    // Adicionar dono como membro
    $memberQuery = "INSERT INTO project_members (project_id, user_id, role) VALUES (:project_id, :user_id, 'owner')";
    $memberStmt = $db->prepare($memberQuery);
    $memberStmt->execute([
        ':project_id' => $project_id,
        ':user_id' => $user['id']
    ]);

    // Criar colunas padrão
    $columns = ['A Fazer', 'Em Andamento', 'Revisão', 'Concluído'];
    $colors = ['#f3f4f6', '#dbeafe', '#fef3c7', '#d1fae5'];

    foreach ($columns as $index => $col) {
        $colQuery = "INSERT INTO columns (project_id, name, position, color) VALUES (:project_id, :name, :position, :color)";
        $colStmt = $db->prepare($colQuery);
        $colStmt->execute([
            ':project_id' => $project_id,
            ':name' => $col,
            ':position' => $index,
            ':color' => $colors[$index]
        ]);
    }

    echo json_encode(['success' => true, 'data' => ['id' => $project_id]]);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao criar projeto']);
}
?>
```

---

### Tarefas

#### GET `/api/tasks/index.php?project_id=1` - Listar Tarefas

```php
<?php
require_once '../config/database.php';
require_once '../includes/auth.php';

$user = authenticate();
if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

$project_id = isset($_GET['project_id']) ? $_GET['project_id'] : null;

$database = new Database();
$db = $database->getConnection();

$query = "SELECT
          t.*,
          c.name as column_name,
          c.color as column_color,
          pr.name as priority_name,
          pr.color as priority_color,
          creator.name as created_by_name,
          assigned.name as assigned_to_name
          FROM tasks t
          JOIN columns c ON t.column_id = c.id
          JOIN priorities pr ON t.priority_id = pr.id
          JOIN users creator ON t.created_by = creator.id
          LEFT JOIN users assigned ON t.assigned_to = assigned.id";

if ($project_id) {
    $query .= " WHERE t.project_id = :project_id";
}

$query .= " ORDER BY t.position ASC";

$stmt = $db->prepare($query);

if ($project_id) {
    $stmt->bindParam(':project_id', $project_id);
}

$stmt->execute();

$tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'success' => true,
    'data' => $tasks
]);
?>
```

#### POST `/api/tasks/create.php` - Criar Tarefa

**Request:**
```json
{
  "project_id": 1,
  "column_id": 1,
  "title": "Nova tarefa",
  "description": "Descrição da tarefa",
  "priority_id": 2,
  "assigned_to": 2,
  "due_date": "2024-01-15"
}
```

```php
<?php
require_once '../config/database.php';
require_once '../includes/auth.php';

$user = authenticate();
if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->getConnection();

// Obter próxima posição
$posQuery = "SELECT MAX(position) as max_pos FROM tasks WHERE column_id = :column_id";
$posStmt = $db->prepare($posQuery);
$posStmt->bindParam(':column_id', $data->column_id);
$posStmt->execute();
$posResult = $posStmt->fetch(PDO::FETCH_ASSOC);
$position = ($posResult['max_pos'] ?? -1) + 1;

$query = "INSERT INTO tasks SET
          project_id = :project_id,
          column_id = :column_id,
          title = :title,
          description = :description,
          priority_id = :priority_id,
          created_by = :created_by,
          assigned_to = :assigned_to,
          due_date = :due_date,
          position = :position";

$stmt = $db->prepare($query);

$stmt->bindParam(':project_id', $data->project_id);
$stmt->bindParam(':column_id', $data->column_id);
$stmt->bindParam(':title', $data->title);
$stmt->bindParam(':description', $data->description);
$stmt->bindParam(':priority_id', $data->priority_id);
$stmt->bindParam(':created_by', $user['id']);
$stmt->bindParam(':assigned_to', $data->assigned_to);
$stmt->bindParam(':due_date', $data->due_date);
$stmt->bindParam(':position', $position);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'data' => ['id' => $db->lastInsertId()]]);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao criar tarefa']);
}
?>
```

---

### Colunas

#### GET `/api/columns/index.php?project_id=1` - Listar Colunas

```php
<?php
require_once '../config/database.php';
require_once '../includes/auth.php';

$user = authenticate();
if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

$project_id = isset($_GET['project_id']) ? $_GET['project_id'] : null;

$database = new Database();
$db = $database->getConnection();

$query = "SELECT c.* FROM columns c";

if ($project_id) {
    $query .= " WHERE c.project_id = :project_id";
}

$query .= " ORDER BY c.position ASC";

$stmt = $db->prepare($query);

if ($project_id) {
    $stmt->bindParam(':project_id', $project_id);
}

$stmt->execute();

$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Buscar tarefas para cada coluna
foreach ($columns as &$col) {
    $taskQuery = "SELECT t.* FROM tasks t WHERE t.column_id = :column_id ORDER BY t.position ASC";
    $taskStmt = $db->prepare($taskQuery);
    $taskStmt->bindParam(':column_id', $col['id']);
    $taskStmt->execute();
    $col['tasks'] = $taskStmt->fetchAll(PDO::FETCH_ASSOC);
}

echo json_encode([
    'success' => true,
    'data' => $columns
]);
?>
```

---

### Usuários

#### GET `/api/users/index.php` - Listar Usuários

```php
<?php
require_once '../config/database.php';
require_once '../includes/auth.php';

$user = authenticate();
if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$query = "SELECT id, name, email, avatar, role FROM users ORDER BY name ASC";
$stmt = $db->prepare($query);
$stmt->execute();

$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'success' => true,
    'data' => $users
]);
?>
```

---

## 🎨 Integração do Frontend

### 1. Adaptar o Código Next.js para JavaScript Vanilla

O protótipo Next.js pode ser convertido para:

**public/assets/js/app.js**
```javascript
const API_BASE = '/api';

// Estado global
let state = {
  user: null,
  token: localStorage.getItem('token'),
  projects: [],
  currentProject: null,
  columns: [],
  tasks: []
};

// Funções de API
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  return await response.json();
}

// Autenticação
async function login(email, password) {
  const result = await apiRequest('/auth/login.php', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  if (result.success) {
    state.token = result.data.token;
    state.user = result.data.user;
    localStorage.setItem('token', result.data.token);
    return true;
  }
  return false;
}

// Carregar projetos
async function loadProjects() {
  const result = await apiRequest('/projects/index.php');
  if (result.success) {
    state.projects = result.data;
    renderProjects();
  }
}

// Carregar colunas e tarefas
async function loadBoard(projectId) {
  const [columnsResult, tasksResult] = await Promise.all([
    apiRequest(`/columns/index.php?project_id=${projectId}`),
    apiRequest(`/tasks/index.php?project_id=${projectId}`)
  ]);

  if (columnsResult.success && tasksResult.success) {
    state.columns = columnsResult.data;
    state.tasks = tasksResult.data;
    renderBoard();
  }
}

// Renderizar projetos
function renderProjects() {
  const container = document.getElementById('projects-container');
  container.innerHTML = state.projects.map(project => `
    <div class="project-card" onclick="loadBoard(${project.id})">
      <h3>${project.name}</h3>
      <p>${project.description}</p>
    </div>
  `).join('');
}

// Renderizar board
function renderBoard() {
  const container = document.getElementById('board-container');
  container.innerHTML = state.columns.map(column => `
    <div class="kanban-column">
      <div class="column-header">
        <h3>${column.name}</h3>
        <span>${column.tasks.length}</span>
      </div>
      <div class="column-tasks">
        ${column.tasks.map(task => `
          <div class="task-card" onclick="showTaskDetails(${task.id})">
            <h4>${task.title}</h4>
            <p>${task.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  if (state.token) {
    loadProjects();
  } else {
    showLoginForm();
  }
});
```

### 2. HTML Principal

**public/index.html**
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Manager</title>
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
  <div id="app">
    <!-- Header -->
    <header id="app-header"></header>

    <!-- Main Content -->
    <main>
      <section id="login-section"></section>
      <section id="dashboard-section"></section>
      <section id="projects-section"></section>
      <section id="board-section"></section>
    </main>
  </div>

  <script src="assets/js/app.js"></script>
</body>
</html>
```

---

## 🚀 Deploy na Hostinger

### Passo a Passo:

1. **Preparar Arquivos**
   - Compacte todos os arquivos PHP em um ZIP
   - Inclua: `/api`, `/config`, `/includes`, `/public`

2. **Upload via FTP**
   - Use FileZilla ou gerenciador de arquivos da Hostinger
   - Faça upload para a pasta `public_html`
   - Mantenha a estrutura de diretórios

3. **Configurar Banco de Dados**
   - Crie o banco MySQL no painel Hostinger
   - Importe o arquivo `database/schema.sql`
   - Atualize as credenciais em `config/database.php`

4. **Configurar Permissões**
   ```
   chmod 755 para diretórios
   chmod 644 para arquivos
   chmod 777 para /public/uploads
   ```

5. **Configurar .htaccess**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule ^api/(.*)$ api/index.php?path=$1 [L,QSA]
   </IfModule>

   <FilesMatch "\.php$">
     Order allow,deny
     Allow from all
   </FilesMatch>
   ```

6. **Testar**
   - Acesse `https://seu-dominio.com.br`
   - Teste login com usuários do seed data
   - Verifique se as APIs estão funcionando

---

## 🔒 Segurança

### Práticas Recomendadas:

1. **Validação de Input**
   ```php
   function sanitizeInput($data) {
     $data = trim($data);
     $data = stripslashes($data);
     $data = htmlspecialchars($data);
     return $data;
   }
   ```

2. **Proteção contra SQL Injection**
   - Sempre usar prepared statements
   - Nunca concatenar strings em queries

3. **HTTPS Obrigatório**
   ```apache
   # Em .htaccess
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

4. **Proteção de Upload**
   ```php
   $allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
   $allowedExts = ['jpg', 'jpeg', 'png', 'pdf'];

   $fileType = $_FILES['file']['type'];
   $fileExt = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));

   if (!in_array($fileType, $allowedTypes) || !in_array($fileExt, $allowedExts)) {
     die('Tipo de arquivo não permitido');
   }
   ```

5. **Rate Limiting**
   ```php
   function checkRateLimit($ip) {
     $limit = 100; // 100 requests por hora
     $key = "rate_limit_" . $ip;

     if (!isset($_SESSION[$key])) {
       $_SESSION[$key] = ['count' => 1, 'time' => time()];
     } else {
       if (time() - $_SESSION[$key]['time'] > 3600) {
         $_SESSION[$key] = ['count' => 1, 'time' => time()];
       } elseif ($_SESSION[$key]['count'] >= $limit) {
         http_response_code(429);
         die('Muitas requisições. Tente novamente mais tarde.');
       } else {
         $_SESSION[$key]['count']++;
       }
     }
   }
   ```

---

## 📚 Recursos Adicionais

### Dependências PHP (composer.json)

```json
{
  "require": {
    "firebase/php-jwt": "^6.0",
    "vlucas/phpdotenv": "^5.0"
  }
}
```

### Testar API

Use Postman ou cURL:

```bash
# Login
curl -X POST https://seu-dominio.com.br/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@projeto.com","password":"senha123"}'

# Listar projetos
curl -X GET https://seu-dominio.com.br/api/projects/index.php \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## ✅ Checklist de Deploy

- [ ] Criar banco de dados MySQL na Hostinger
- [ ] Importar schema.sql
- [ ] Configurar credenciais em config/database.php
- [ ] Upload dos arquivos via FTP
- [ ] Configurar permissões de pastas
- [ ] Configurar .htaccess
- [ ] Testar login
- [ ] Testar criação de projeto
- [ ] Testar criação de tarefa
- [ ] Verificar funcionamento do Kanban
- [ ] Configurar HTTPS
- [ ] Testar em dispositivos móveis

---

## 🎓 Próximos Passos

1. Implementar sistema de notificações
2. Adicionar WebSocket para atualizações em tempo real
3. Implementar sistema de anexos de arquivos
4. Adicionar gráficos e relatórios
5. Implementar sistema de tags e filtros avançados
6. Adicionar comentários e atividade log

---

## 💡 Dicas

- Use variáveis de ambiente para dados sensíveis
- Implemente logging para debug
- Faça backup regular do banco de dados
- Monitore performance e erros
- Mantenha PHP e dependências atualizadas

---

**Documentação criada em: 2024-01-01**
**Versão: 1.0**
