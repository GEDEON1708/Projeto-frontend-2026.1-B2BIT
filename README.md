# Mini Twitter

Desafio tecnico full stack da B2Bit para construir uma mini rede social com autenticacao, timeline publica, interacoes em posts e uma experiencia moderna no frontend.

## Resumo

O objetivo deste projeto foi entregar uma aplicacao inspirada no fluxo basico de uma rede social, cobrindo tanto a camada de API quanto a interface web.

O repositorio esta organizado como um workspace com duas aplicacoes:

- `mini-twitter-backend-main`: API REST responsavel por autenticacao, regras de negocio e persistencia.
- `mini-twitter-frontend`: aplicacao web que consome a API e entrega a experiencia do usuario.

## Diferenciais

- arquitetura full stack separada em frontend e backend, facilitando manutencao e evolucao.
- autenticacao com JWT e invalidacao de token no logout via blacklist.
- regras de autorizacao garantindo edicao e exclusao apenas pelo autor do post.
- busca por titulo, conteudo e autor combinada com paginacao no backend.
- scroll infinito no feed com cache e sincronizacao de dados no frontend via React Query.
- seed com usuarios e posts de demonstracao para avaliacao imediata.
- testes automatizados cobrindo o fluxo principal da API.
- documentacao interativa da API com Swagger.

## Stack utilizada

### Backend

- Bun como runtime
- ElysiaJS como framework HTTP
- SQLite com `bun:sqlite` para persistencia local
- JWT para autenticacao
- Swagger/OpenAPI para documentacao da API
- Bun Test para testes automatizados da API

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- TanStack React Query para cache e sincronizacao de dados
- React Hook Form + Zod para formularios e validacao
- Zustand para estado de autenticacao
- Axios para comunicacao HTTP

## Funcionalidades entregues

- cadastro de usuario
- login e logout com invalidacao do token
- timeline publica com paginacao
- busca de posts por titulo, conteudo e autor
- criacao de post com titulo, conteudo e imagem por URL
- edicao e exclusao apenas pelo autor do post
- like e deslike em posts
- scroll infinito no feed
- tratamento de estados de carregamento e erro no frontend
- seed com usuarios e posts para demonstracao
- testes automatizados cobrindo fluxo principal da API

## Preview

Esta secao fica pronta para receber screenshots ou gifs do projeto, o que ajuda bastante na avaliacao visual do repositorio. Sugestao de capturas para adicionar depois:

- tela de autenticacao com abas de login e cadastro
- feed principal com busca e scroll infinito
- criacao e edicao de post
- fluxo de interacao com likes

Exemplo de como incluir quando voce tiver as imagens:

```md
![Tela de autenticacao](docs/screenshots/auth.png)
![Feed principal](docs/screenshots/feed.png)
```

## Estrutura do projeto

```text
.
|-- mini-twitter-backend-main
|   |-- src
|   |-- tests
|   `-- seed.ts
|-- mini-twitter-frontend
|   |-- src
|   `-- .env.example
`-- README.md
```

## Como executar localmente

### 1. Subir o backend

```bash
cd mini-twitter-backend-main
bun install
bun run seed
bun run dev
```

API disponivel em `http://localhost:3000`

Swagger disponivel em `http://localhost:3000/swagger`

### 2. Subir o frontend

Em outro terminal:

```bash
cd mini-twitter-frontend
npm install
copy .env.example .env
npm run dev
```

No macOS ou Linux, substitua por:

```bash
cp .env.example .env
```

Frontend disponivel em `http://localhost:5173`

## Deploy do backend no Railway

Este repositorio ja foi preparado para deploy do backend com Railway usando o `Dockerfile` e o `railway.json` na raiz.

Passo a passo sugerido:

1. Crie um novo projeto no Railway conectando este repositorio do GitHub.
2. Na configuracao do servico, adicione um volume montado em `/data`.
3. Configure as variaveis:

```bash
JWT_SECRET=uma-chave-secreta-forte
DATABASE_PATH=/data/db.sqlite
```

4. Gere um dominio publico em `Settings > Networking > Public Networking`.
5. Use a URL gerada como URL base para a avaliacao dos endpoints.

Observacoes importantes:

- a aplicacao agora suporta `PORT` dinamica para funcionar corretamente na nuvem.
- o banco SQLite pode ficar persistente usando o volume montado em `/data`.
- o endpoint `GET /health` foi adicionado para healthcheck do servico.
- se o banco estiver vazio no primeiro boot, a API aplica o seed inicial automaticamente.

## Variaveis de ambiente

### Frontend

Arquivo `.env`:

```bash
VITE_API_URL=http://localhost:3000
```

### Backend

Opcionalmente, a API aceita:

```bash
JWT_SECRET=super-secret-key
DATABASE_PATH=db.sqlite
```

## Contas para demonstracao

Depois de executar `bun run seed`, estas contas podem ser usadas:

- `gedeon@example.com` / `password123`
- `alice@example.com` / `password123`
- `bruno@example.com` / `password123`
- `mariana@example.com` / `password123`
- `rafael@example.com` / `password123`

## Validacao e testes

### Backend

```bash
cd mini-twitter-backend-main
bun test
```

### Frontend

```bash
cd mini-twitter-frontend
npm run build
```

## Decisoes tecnicas

- o backend usa SQLite para simplificar a execucao local e reduzir dependencias externas.
- a autenticacao foi implementada com JWT e blacklist para suportar logout invalidador de sessao.
- o frontend usa React Query para paginacao e atualizacao de dados do feed com melhor experiencia de uso.
- o seed inicial facilita a avaliacao do desafio sem depender de cadastro manual de massa de dados.

## Observacoes

- o projeto foi preparado para avaliacao tecnica e execucao local rapida.
- para resetar os dados da aplicacao, rode `bun run seed` no backend.
