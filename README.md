
🚀 Projeto Gerenciador de Mídias (ADS)
Este é um projeto full-stack desenvolvido para a disciplina de Análise e Desenvolvimento de Sistemas. A aplicação permite gerenciar uma lista de mídias (links de vídeos/áudios) com funcionalidades de CRUD completas, com o objetivo futuro de integrar uma API de Inteligência Artificial para transcrição de conteúdo.

#

✅ Funcionalidades (Entrega 1)


[x] Listar (Read): Visualizar a lista completa de mídias cadastradas.

[x] Adicionar (Create): Inserir uma nova mídia através de um formulário interativo.

[x] Atualizar (Update): Editar o título e a URL de uma mídia existente.

[x] Apagar (Delete): Remover uma mídia da lista.

[x] Interface Responsiva: O layout se adapta a diferentes tamanhos de tela, de desktops a celulares.

#

🛠️ Tecnologias Utilizadas
O projeto foi construído utilizando uma stack moderna e robusta de JavaScript.


Backend
Ambiente de Execução: Node.js

Framework: Express.js para a construção da API RESTful.

Banco de Dados: MySQL

#

Dependências:


mysql2: Driver para a conexão com o banco de dados.

cors: Para habilitar a comunicação entre o frontend e o backend.

dotenv: Para gerenciar as variáveis de ambiente de forma segura.

nodemon: Para reiniciar o servidor automaticamente durante o desenvolvimento.

#

Frontend
Biblioteca: React para a construção da interface de usuário.

Ferramenta de Build: Vite para um desenvolvimento rápido e otimizado.

Cliente HTTP: Axios para fazer a comunicação com a API do backend.

Estilização: CSS puro com foco em responsividade (Flexbox e Media Queries).

#

⚙️ Guia de Instalação e Execução Local
Esta seção é destinada a outros desenvolvedores (incluindo o avaliador do projeto) que desejam clonar e executar a aplicação em sua própria máquina.

Pré-requisitos
Node.js (versão 18 ou superior)


1. Clonar o Repositório
git clone [https://github.com/Edcarlosnew/projeto-ads-midias.git](https://github.com/Edcarlosnew/projeto-ads-midias.git)
cd projeto-ads-midias

2. Configuração do Backend
Primeiro, configure e inicie o servidor do backend.
#

# 1. Navegue para a pasta do backend
cd backend

# 2. Instale as dependências
npm install

# 3. Inicie o servidor em modo de desenvolvimento
npm run dev

O servidor estará rodando em http://localhost:3001.

Configuração do Frontend
Com o backend rodando, inicie a aplicação React em outro terminal.



# 1. Navegue para a pasta do frontend (a partir da raiz do projeto)
cd frontend

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

A aplicação estará disponível em http://localhost:5173 (ou outra porta indicada pelo Vite).

API Endpoints
A API do backend possui os seguintes endpoints para a gestão de mídias:

Método==================Rota====================Descrição

GET====================/midias===================Retorna a lista de mídias.

POST===================/midias===================Cria uma nova mídia.

PUT====================/midias/:id=================Atualiza uma mídia existente.

DELETE=================/midias/:id==================Apaga uma mídia existente.



🔮 Próximos Passos (Entregas Futuras)
Entrega 2: Integração com IA para transcrição automática de áudio/vídeo.

Entrega 3: Implementação de busca avançada no conteúdo transcrito.

Entrega 4: Sistema completo de autenticação de usuários (Cadastro e Login).

Desenvolvido por Edcarlos Almeida.