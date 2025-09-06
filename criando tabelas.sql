-- 1. Cria o banco de dados do projeto, se ele ainda não existir.
CREATE DATABASE IF NOT EXISTS projeto_ads;

-- 2. Informa ao MySQL que todos os comandos a seguir devem ser executados dentro deste banco de dados.
USE projeto_ads;

-- 3. Cria a tabela de usuários.
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

-- 4. Cria a tabela de mídias, com uma "chave estrangeira" que a liga à tabela de usuários.
CREATE TABLE midias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255),
    url_midia TEXT NOT NULL,
    texto_transcricao TEXT,
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 5. Insere um usuário de teste para que possamos trabalhar.
INSERT INTO usuarios (nome, email, senha) VALUES ('Usuario Teste', 'teste@email.com', 'Senac@ti562022');

-- 6. Confirma que o usuário foi inserido.
SELECT * FROM usuarios;