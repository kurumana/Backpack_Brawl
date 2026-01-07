-- ============================================
-- Sistema de Gerenciamento de Projetos
-- Estilo Monday.com
-- Schema MySQL para Hostinger
-- ============================================

-- Criar banco de dados
-- CREATE DATABASE IF NOT EXISTS project_manager DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE project_manager;

-- ============================================
-- Tabela de Usuários (Equipe)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    role ENUM('admin', 'manager', 'member') DEFAULT 'member',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabela de Projetos
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366f1',
    icon VARCHAR(50) DEFAULT 'folder',
    owner_id INT NOT NULL,
    status ENUM('active', 'archived', 'completed') DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabela de Membros do Projeto
-- ============================================
CREATE TABLE IF NOT EXISTS project_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('owner', 'manager', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_user (project_id, user_id),
    INDEX idx_project (project_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabela de Colunas (Para Kanban)
-- ============================================
CREATE TABLE IF NOT EXISTS columns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    position INT NOT NULL DEFAULT 0,
    color VARCHAR(7) DEFAULT '#e5e7eb',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project (project_id),
    INDEX idx_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabela de Prioridades de Tarefas
-- ============================================
CREATE TABLE IF NOT EXISTS priorities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    value INT NOT NULL,
    color VARCHAR(7) NOT NULL,
    icon VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir prioridades padrão
INSERT INTO priorities (name, value, color, icon) VALUES
('Baixa', 1, '#22c55e', 'arrow-down'),
('Média', 2, '#eab308', 'minus'),
('Alta', 3, '#f97316', 'arrow-up'),
('Urgente', 4, '#ef4444', 'alert');

-- ============================================
-- Tabela de Tarefas (Tasks)
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    column_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority_id INT DEFAULT 2,
    created_by INT,
    assigned_to INT,
    status ENUM('todo', 'in_progress', 'review', 'done') DEFAULT 'todo',
    position INT NOT NULL DEFAULT 0,
    due_date DATETIME,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (priority_id) REFERENCES priorities(id) ON DELETE SET NULL,
    INDEX idx_project (project_id),
    INDEX idx_column (column_id),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_priority (priority_id),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabela de Tags
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabela de Associação Task-Tags
-- ============================================
CREATE TABLE IF NOT EXISTS task_tags (
    task_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabela de Comentários
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_task (task_id),
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabela de Anexos
-- ============================================
CREATE TABLE IF NOT EXISTS attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    uploaded_by INT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    file_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_task (task_id),
    INDEX idx_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabela de Histórico de Atividades
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    task_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    INDEX idx_project (project_id),
    INDEX idx_task (task_id),
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabela de Notificações
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'info',
    is_read TINYINT(1) DEFAULT 0,
    link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Dados de Exemplo (Seed Data)
-- ============================================

-- Usuários de exemplo
INSERT INTO users (name, email, password, role, avatar) VALUES
('Administrador', 'admin@projeto.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'A'),
('João Silva', 'joao@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', 'J'),
('Maria Santos', 'maria@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member', 'M'),
('Pedro Costa', 'pedro@exemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member', 'P');

-- Projetos de exemplo
INSERT INTO projects (name, description, color, icon, owner_id, start_date, end_date) VALUES
('Lançamento do Site', 'Desenvolvimento e lançamento do novo site corporativo', '#6366f1', 'folder', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
('App Mobile', 'Desenvolvimento do aplicativo mobile', '#8b5cf6', 'smartphone', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY)),
('Marketing Q1', 'Campanha de marketing do primeiro trimestre', '#f59e0b', 'megaphone', 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY));

-- Colunas padrão para cada projeto
INSERT INTO columns (project_id, name, position, color) VALUES
(1, 'A Fazer', 0, '#f3f4f6'),
(1, 'Em Andamento', 1, '#dbeafe'),
(1, 'Revisão', 2, '#fef3c7'),
(1, 'Concluído', 3, '#d1fae5'),
(2, 'A Fazer', 0, '#f3f4f6'),
(2, 'Em Andamento', 1, '#dbeafe'),
(2, 'Revisão', 2, '#fef3c7'),
(2, 'Concluído', 3, '#d1fae5'),
(3, 'A Fazer', 0, '#f3f4f6'),
(3, 'Em Andamento', 1, '#dbeafe'),
(3, 'Revisão', 2, '#fef3c7'),
(3, 'Concluído', 3, '#d1fae5');

-- Tags de exemplo
INSERT INTO tags (project_id, name, color) VALUES
(1, 'Design', '#ec4899'),
(1, 'Frontend', '#3b82f6'),
(1, 'Backend', '#10b981'),
(1, 'Urgente', '#ef4444'),
(2, 'iOS', '#000000'),
(2, 'Android', '#22c55e'),
(2, 'UI/UX', '#8b5cf6'),
(3, 'Redes Sociais', '#f59e0b'),
(3, 'Email', '#06b6d4');

-- Tarefas de exemplo
INSERT INTO tasks (project_id, column_id, title, description, priority_id, created_by, assigned_to, status, position) VALUES
-- Projeto 1: Lançamento do Site
(1, 1, 'Criar wireframes', 'Desenhar wireframes de todas as páginas principais', 2, 2, 2, 'in_progress', 0),
(1, 1, 'Configurar servidor', 'Setup do servidor de produção', 3, 2, 3, 'in_progress', 1),
(1, 2, 'Implementar homepage', 'Desenvolver a página inicial', 2, 2, 2, 'todo', 0),
(1, 2, 'Criar componentes', 'Desenvolver componentes reutilizáveis', 2, 2, 2, 'todo', 1),
(1, 3, 'Revisar design', 'Aprovação final do design', 2, 1, 1, 'done', 0),

-- Projeto 2: App Mobile
(2, 5, 'Setup do projeto', 'Inicializar projeto React Native', 2, 1, 3, 'done', 0),
(2, 6, 'Desenvolver tela de login', 'Implementar autenticação', 3, 1, 3, 'in_progress', 0),
(2, 6, 'API de usuários', 'Criar endpoints de usuários', 2, 1, 3, 'in_progress', 1),
(2, 7, 'Testes iOS', 'Testes em dispositivos iOS', 2, 2, 4, 'todo', 0),

-- Projeto 3: Marketing Q1
(3, 9, 'Criar banner', 'Desenhar banner para campanha', 2, 2, 2, 'done', 0),
(3, 10, 'Escrever emails', 'Criar sequência de emails', 3, 2, 2, 'in_progress', 0),
(3, 11, 'Aprovar materiais', 'Aprovação final dos materiais', 2, 1, 1, 'todo', 0);

-- Membros dos projetos
INSERT INTO project_members (project_id, user_id, role) VALUES
(1, 1, 'owner'),
(1, 2, 'manager'),
(1, 3, 'member'),
(2, 1, 'owner'),
(2, 3, 'manager'),
(2, 4, 'member'),
(3, 2, 'owner'),
(3, 1, 'manager');

-- Comentários de exemplo
INSERT INTO comments (task_id, user_id, content) VALUES
(1, 3, 'Preciso que inclua a página de preços também'),
(2, 3, 'Vou usar AWS ou Google Cloud?'),
(3, 2, 'Já tenho o design pronto, posso compartilhar'),
(6, 4, 'Testei no Android e está funcionando bem');

-- Anexos de exemplo
INSERT INTO attachments (task_id, uploaded_by, file_name, file_path, file_size, file_type) VALUES
(1, 2, 'wireframe-home.fig', '/uploads/wireframe-home.fig', 2456789, 'application/octet-stream'),
(3, 1, 'design-preview.png', '/uploads/design-preview.png', 1456789, 'image/png');

-- Atividades de exemplo
INSERT INTO activity_log (user_id, project_id, task_id, action, entity_type, entity_id, old_value, new_value) VALUES
(2, 1, 1, 'criou', 'task', 1, NULL, 'Criar wireframes'),
(2, 1, 1, 'moveu', 'task', 1, 'A Fazer', 'Em Andamento'),
(3, 1, 1, 'comentou', 'task', 1, NULL, 'Preciso que inclua a página de preços também'),
(1, 1, 5, 'aprovou', 'task', 5, 'Revisão', 'Concluído');

-- ============================================
-- Views Úteis
-- ============================================

-- View para estatísticas do projeto
CREATE OR REPLACE VIEW project_stats AS
SELECT
    p.id as project_id,
    p.name as project_name,
    COUNT(DISTINCT pm.user_id) as member_count,
    COUNT(t.id) as total_tasks,
    SUM(CASE WHEN t.status = 'todo' THEN 1 ELSE 0 END) as todo_count,
    SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
    SUM(CASE WHEN t.status = 'review' THEN 1 ELSE 0 END) as review_count,
    SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as done_count,
    SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(t.id), 0) as completion_rate
FROM projects p
LEFT JOIN project_members pm ON p.id = pm.project_id
LEFT JOIN tasks t ON p.id = t.project_id
WHERE p.status = 'active'
GROUP BY p.id, p.name;

-- View para tarefas com detalhes
CREATE OR REPLACE VIEW task_details AS
SELECT
    t.*,
    p.name as project_name,
    p.color as project_color,
    c.name as column_name,
    c.color as column_color,
    pr.name as priority_name,
    pr.color as priority_color,
    pr.icon as priority_icon,
    creator.name as created_by_name,
    creator.avatar as created_by_avatar,
    assigned.name as assigned_to_name,
    assigned.avatar as assigned_to_avatar
FROM tasks t
JOIN projects p ON t.project_id = p.id
JOIN columns c ON t.column_id = c.id
JOIN priorities pr ON t.priority_id = pr.id
JOIN users creator ON t.created_by = creator.id
LEFT JOIN users assigned ON t.assigned_to = assigned.id;

-- ============================================
-- Stored Procedures Úteis
-- ============================================

DELIMITER //

-- Procedure para atualizar a posição de tarefas
CREATE PROCEDURE reorder_tasks(IN p_column_id INT, IN p_task_id INT, IN p_new_position INT)
BEGIN
    DECLARE old_position INT;
    DECLARE p_project_id INT;

    -- Obter posição atual e projeto
    SELECT position, project_id INTO old_position, p_project_id
    FROM tasks WHERE id = p_task_id;

    -- Se movendo para frente
    IF p_new_position > old_position THEN
        UPDATE tasks
        SET position = position - 1
        WHERE column_id = p_column_id AND position > old_position AND position <= p_new_position;
    -- Se movendo para trás
    ELSEIF p_new_position < old_position THEN
        UPDATE tasks
        SET position = position + 1
        WHERE column_id = p_column_id AND position >= p_new_position AND position < old_position;
    END IF;

    -- Atualizar posição da tarefa
    UPDATE tasks SET position = p_new_position WHERE id = p_task_id;
END //

-- Procedure para marcar tarefa como concluída
CREATE PROCEDURE complete_task(IN p_task_id INT)
BEGIN
    UPDATE tasks
    SET status = 'done',
        completed_at = CURRENT_TIMESTAMP,
        column_id = (SELECT id FROM columns WHERE project_id = tasks.project_id AND name = 'Concluído' LIMIT 1)
    WHERE id = p_task_id;
END //

DELIMITER ;

-- ============================================
-- Triggers
-- ============================================

DELIMITER //

-- Trigger para logar mudanças de status
CREATE TRIGGER after_task_status_change
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO activity_log (user_id, project_id, task_id, action, entity_type, entity_id, old_value, new_value)
        VALUES (NEW.assigned_to, NEW.project_id, NEW.id, 'mudou status', 'task', NEW.id, OLD.status, NEW.status);
    END IF;
END //

DELIMITER ;
