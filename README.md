# Gestão de estoque — back-end

API REST em Node.js, Express e Prisma para autenticação, produtos, categorias e movimentações de estoque em PostgreSQL.

## Pré-requisitos

- Node.js e npm
- PostgreSQL acessível pela máquina que executa a API

## Instalação

Na pasta `gestao-estoque-backend`, instale as dependências:

```bash
npm ci
```

Crie um arquivo `.env` na raiz do back-end. Preencha as URLs com os dados do seu PostgreSQL e defina um segredo forte para os tokens de sessão:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/NOME_DO_BANCO?schema=public"
DIRECT_URL="postgresql://USUARIO:SENHA@HOST:5432/NOME_DO_BANCO?schema=public"
JWT_SECRET="substitua-por-um-segredo-aleatorio"
REMOVE_BG_API_KEY="sua_chave_do_remove.bg"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

Não compartilhe nem versione o `.env`. Em ambientes com pooler de conexões, use a URL recomendada pelo provedor em `DATABASE_URL` e a conexão direta em `DIRECT_URL`.

## Banco de dados

O Prisma usa o schema em `prisma/schema.prisma`. Depois de configurar o `.env`, gere o cliente e valide a configuração:

```bash
npm run db:generate
npm run db:validate
```

A classe de domínio `Produto` fica em `src/models/Produto.js`. O construtor inicializa os dados; os getters e setters acessam e validam as propriedades; `registrarEntrada` e `registrarSaida` aplicam as regras de estoque; e `valorTotalEmEstoque` calcula o valor atual do produto em estoque.

Este repositório não inclui migrations nem cria as tabelas automaticamente. Conecte a API a um banco que já tenha o schema de estoque, o enum `tipo_movimentacao`, as procedures `registrar_entrada` e `registrar_saida` e os triggers usados para movimentações e atualização de `atualizado_em`.

Para adicionar o campo de imagem à tabela existente no Supabase, execute `prisma/add_imagem_url.sql` uma vez. A coluna `imagem_url` guarda a imagem compactada como data URL.

O formulário de produtos armazena uma imagem WebP compactada no campo `imagem_url`. Ao pedir a remoção de fundo, a API envia o arquivo ao remove.bg; configure `REMOVE_BG_API_KEY` no `.env` do back-end. O endpoint aceita JPEG, PNG e WebP de até 20 MB e é limitado a 20 processamentos por hora.

## Executar

Para desenvolvimento, com reinício automático ao alterar arquivos:

```bash
npm run dev
```

Para iniciar sem o monitor de desenvolvimento:

```bash
npm start
```

A API escuta em `http://localhost:3000` por padrão. `PORT` pode alterar a porta. `FRONTEND_URL` deve corresponder à origem do front-end para que o navegador possa enviar os cookies de sessão.

## Autenticação e rotas

O login é feito em `POST /login`; a sessão é mantida em cookie. Produtos e categorias exigem autenticação. A API não tem rota de cadastro: use uma conta já existente em `public.usuarios` para entrar pela interface.

As principais rotas autenticadas são:

- `GET`, `POST`, `PUT` e `DELETE /produtos`
- `POST /produtos/:id/entrada` e `POST /produtos/:id/saida`
- `GET`, `POST`, `PUT` e `DELETE /categorias`
- `GET /auth/me`, `PUT /auth/password` e `POST /logout`

## Comandos disponíveis

- `npm run dev`: inicia em modo de desenvolvimento com Nodemon.
- `npm start`: inicia a API.
- `npm run db:generate`: gera o cliente Prisma.
- `npm run db:validate`: valida o schema Prisma.
