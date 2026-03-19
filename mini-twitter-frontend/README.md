# Mini Twitter Frontend

Frontend do desafio Mini Twitter.

## Como rodar

O frontend depende do backend do desafio rodando localmente.

### Backend

No terminal:

```bash
cd ../mini-twitter-backend-main
bun install
bun run seed
bun run dev
```

A API fica disponivel em `http://localhost:3000`.

### Frontend

Em outro terminal:

```bash
cd ../mini-twitter-frontend
npm install
copy .env.example .env
npm run dev
```

No macOS ou Linux, use:

```bash
cp .env.example .env
```

O frontend fica disponivel em `http://localhost:5173`.

## Variavel de ambiente

Por padrao, o projeto usa:

```bash
VITE_API_URL=http://localhost:3000
```

## Contas para teste

Depois de rodar o seed, estas contas podem ser usadas no login:

- `gedeon@example.com` / `password123`
- `alice@example.com` / `password123`
- `bruno@example.com` / `password123`
- `mariana@example.com` / `password123`
- `rafael@example.com` / `password123`

## Funcionalidades

- cadastro de usuario
- login e logout
- timeline publica com busca
- scroll infinito
- criacao de post com imagem por URL
- edicao e exclusao de posts do proprio autor
- like e deslike

## Verificacao

Para conferir o projeto:

```bash
cd ../mini-twitter-backend-main
bun test
```

```bash
cd ../mini-twitter-frontend
npm run build
```

## Observacoes

- Se quiser voltar para a base inicial, rode `bun run seed` no backend.
- O frontend foi feito para consumir a API entregue no desafio.
