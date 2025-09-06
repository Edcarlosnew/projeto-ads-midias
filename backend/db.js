// Importa a biblioteca para gerenciar as variáveis de ambiente
require('dotenv').config();

// Importa a biblioteca do MySQL
const mysql = require('mysql2');

// Cria a "piscina" de conexões com o banco de dados
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  // Pega a senha do arquivo .env
  password: process.env.DB_PASSWORD,
  // Aponta para o nosso banco de dados criado no Workbench
  database: 'projeto_ads'
}).promise(); // Usamos .promise() para poder usar async/await

// Exporta a "piscina" para que outros arquivos possam usá-la
module.exports = pool;