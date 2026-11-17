# 🍳 O que sobrou — Backend

API do **O que sobrou**, um app que vai gerar receitas com inteligência artificial a partir dos ingredientes que o usuário já tem em casa, informando o valor nutricional e respeitando restrições de saúde.

> Ex.: ovos, cebola, presunto, coentro e tomate → uma omelete completa, com calorias e macronutrientes.

## 📍 Status do projeto

🚧 **Em desenvolvimento.** A autenticação, a modelagem de dados, o catálogo de ingredientes, a despensa, o perfil de saúde e o **pedido de geração de receitas** (fila de requisições com status e nova tentativa) estão prontos. A integração com a IA, o processamento da fila e o cálculo nutricional são a próxima etapa.

## ✅ O que já funciona

### Autenticação
- Cadastro de usuário (`signup`) com senha protegida por hash (argon2)
- Login (`signin`) com JWT (access token de 15 minutos)
- Refresh token com rotação e revogação (`/auth/refresh`)
- Rotas protegidas por autenticação (guard com Bearer token e decorator `@Public()` para rotas abertas)
- Verificação de e-mail após o cadastro, com reenvio do link
- Recuperação de senha por e-mail (`forgot-password` e `reset-password`)
- Respostas que não revelam se um e-mail está cadastrado (proteção contra enumeração de contas)
- Envio de e-mails transacionais com [Resend](https://resend.com/)

### Domínio do app
- **Catálogo de ingredientes** (base TACO, 593 itens carregados por seed) com valores nutricionais por 100 g, aliases e alérgenos, consultável com paginação
- **Despensa** do usuário: CRUD de itens, ligados ao catálogo ou com nome livre, com quantidade e unidade
- **Perfil de saúde**: condições de saúde, alérgenos, preferências alimentares, ingredientes que não gosta, meta calórica diária e aceite do aviso de que o app não substitui acompanhamento médico ou nutricional
- **Pedido de geração de receita**: recebe itens da despensa e/ou ingredientes avulsos, mais opções (tipo de refeição, porções, tempo máximo de preparo e receita saudável). Registra o pedido com status `PENDING`, guardando os ingredientes enviados e uma cópia do perfil de saúde da época
- **Consulta e nova tentativa**: acompanha o status do pedido e permite repetir pedidos com falha (até 3 tentativas)
- **Receitas**: listagem, detalhe e remoção das receitas do usuário
- Validação dos dados de entrada (class-validator, com `whitelist` e `forbidNonWhitelisted` globais)

### Qualidade e infraestrutura
- Modelagem completa do banco com Prisma: usuários, perfil de saúde, ingredientes, despensa, receitas (ingredientes, passos e nutrição), favoritos e auditoria das gerações
- Testes unitários dos serviços e controllers (auth/refresh token, despensa, ingredientes, perfil de saúde, receitas e geração) e teste e2e de condição de corrida na renovação do refresh token
- Pipeline de testes unitários no GitHub Actions a cada push e pull request
- API containerizada com Docker

## 🔜 Próximos passos

- [x] Popular o catálogo de ingredientes (base TACO) com seed
- [x] Despensa, perfil de saúde e pedido de geração de receitas
- [ ] Integração com IA para gerar receitas a partir dos ingredientes (módulos `ai` e `recipe-worker` já criados, ainda sem implementação)
- [ ] Processamento assíncrono dos pedidos com fila (BullMQ)
- [ ] Cálculo do valor nutricional pelo backend (e não pela IA)
- [ ] Validador de segurança considerando condições de saúde e alérgenos (ex.: diabetes)
- [ ] Favoritos de receitas (tabela pronta, faltam os endpoints)
- [ ] Ampliar os testes automatizados
- [ ] Deploy

## 🧠 Decisões de projeto

- **A IA sugere a receita, o backend calcula a nutrição.** Cada ingrediente guarda seus valores por 100 g, as quantidades são convertidas para gramas e a nutrição por porção é calculada no servidor, com um campo de cobertura que indica quando o valor é apenas estimado.
- **Perfil de saúde no cadastro.** Condições de saúde, alérgenos (exclusão rígida), preferências alimentares e aceite do aviso de que o app não substitui acompanhamento médico ou nutricional.
- **Geração assíncrona.** Pedir uma receita cria um registro com status (`PENDING`, `SUCCEEDED`, `REJECTED_BY_SAFETY` ou `FAILED`) e responde na hora; o resultado é consultado depois pelo id.
- **Auditoria das gerações.** Cada geração registra os ingredientes enviados, as opções escolhidas, uma cópia do perfil de saúde da época, as tentativas e o resultado da validação.
- **Autenticação sem vazar informação.** Os endpoints de reenvio de verificação e de recuperação de senha respondem sempre com a mesma mensagem, exista a conta ou não.
- **Isolamento por usuário.** Despensa, receitas e pedidos de geração são sempre filtrados pelo id do usuário autenticado.

## 🛠️ Stack

- [NestJS](https://nestjs.com/) + TypeScript
- [Prisma 8](https://www.prisma.io/) (ORM, versão candidata)
- [PostgreSQL](https://www.postgresql.org/)
- [BullMQ](https://bullmq.io/) (dependência instalada para a futura fila de geração)
- [Docker](https://www.docker.com/) + Docker Compose
- JWT (access token) + refresh token com hash no banco
- [Resend](https://resend.com/) (e-mails)
- Jest (testes) + GitHub Actions (CI)
- pnpm

## 📋 Pré-requisitos

- Node.js 22.18+ (ou 24.11+)
- pnpm
- PostgreSQL rodando (o projeto usa a porta `5433` por padrão)
- Docker e Docker Compose (opcional, para rodar a API em container)

## 🚀 Como rodar

```bash
# 1. Clone o repositório
git clone https://github.com/rdavila-mesquita/o-que-sobrou-backend.git
cd o-que-sobrou-backend

# 2. Configure as variáveis de ambiente
cp .env.example .env
# edite o .env com suas credenciais e defina os segredos JWT

# 3. Instale as dependências
pnpm install

# 4. Gere os artefatos do contrato do Prisma
pnpm run contract:emit

# 5. Rode as migrations
pnpm run migrate

# 6. Popule o catálogo de ingredientes (base TACO)
pnpm run db:seed

# 7. Inicie a API em modo desenvolvimento
pnpm run dev
```

A API sobe em `http://localhost:3000`.

### Build e execução em produção

```bash
pnpm run build   # gera o bundle em dist/
pnpm start       # executa dist/server.mjs
```

### Rodando os testes

```bash
pnpm test           # todos os testes
pnpm run test:unit  # apenas os unitários (os mesmos do CI)
pnpm run test:e2e   # apenas os e2e (usa o .env.test)
```

> Os testes e2e precisam de um PostgreSQL de teste, configurado no `.env.test` (porta `5434` por padrão).

### Rodando a API com Docker

O `docker-compose.yml` sobe apenas a **API**. Ela se conecta ao PostgreSQL que está rodando na sua máquina, na porta `5433`.

```bash
docker compose up -d --build   # builda e sobe a API em segundo plano
docker compose logs -f         # acompanha os logs
docker compose down            # para e remove o container
```

## 📜 Scripts

| Script                      | O que faz                                  |
| --------------------------- | ------------------------------------------ |
| `pnpm run dev`              | Inicia a API em modo watch, lendo o `.env` |
| `pnpm run build`            | Gera o build de produção (tsdown)          |
| `pnpm start`                | Executa o build gerado                     |
| `pnpm test`                 | Roda todos os testes (Jest)                |
| `pnpm run test:unit`        | Roda só os testes unitários                |
| `pnpm run test:e2e`         | Roda só os testes e2e                      |
| `pnpm run contract:emit`    | Gera os artefatos do contrato do Prisma    |
| `pnpm run migrate`          | Aplica as migrations no banco              |
| `pnpm run migration:plan`   | Planeja uma nova migration                 |
| `pnpm run migration:show`   | Mostra os detalhes de uma migration        |
| `pnpm run migration:status` | Mostra o status das migrations             |
| `pnpm run db:seed`          | Popula o catálogo de ingredientes (TACO)   |

## 📁 Estrutura

```
.
├── .github/workflows/        # CI: testes unitários
├── migrations/               # migrations do banco e snapshots do contrato
├── src/
│   ├── auth/                 # signup, signin, refresh token
│   ├── email/                # envio de e-mails (Resend)
│   ├── email-verification/   # verificação de e-mail
│   ├── password-recovery/    # recuperação de senha
│   ├── health-profile/       # perfil de saúde do usuário
│   ├── ingredients/          # catálogo de ingredientes
│   ├── pantry/               # despensa do usuário
│   ├── recipe-generation/    # pedidos de geração de receita
│   ├── recipes/              # receitas salvas
│   ├── recipe-worker/        # processamento da fila (em construção)
│   ├── ai/                   # integração com a IA (em construção)
│   ├── common/               # guards, decorators, validators e enums
│   ├── prisma/               # contrato, schema, seed e dados da TACO
│   ├── tests/                # testes e2e
│   └── main.ts
├── module.ts                 # módulo usado pelos scripts composer:dev e composer:deploy
├── prisma.config.ts          # configuração do Prisma
├── tsdown.config.ts          # configuração do build
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## 🔐 Variáveis de ambiente

| Variável             | Descrição                                                          |
| -------------------- | ------------------------------------------------------------------ |
| `POSTGRES_USER`      | Usuário do PostgreSQL                                              |
| `POSTGRES_PASSWORD`  | Senha do PostgreSQL (também usada pelo Docker Compose)             |
| `POSTGRES_DB`        | Nome do banco                                                      |
| `DATABASE_URL`       | String de conexão usada pela API                                   |
| `PORT`               | Porta da API (padrão: 3000)                                        |
| `APP_URL`            | URL base da aplicação, usada nos links enviados por e-mail         |
| `JWT_SECRET`         | Segredo para assinar o access token                                |
| `JWT_EXPIRES_IN`     | Expiração do access token (ex.: `15m`)                             |
| `JWT_REFRESH_SECRET` | Segredo reservado para o refresh token                             |
| `RESEND_API_KEY`     | Chave de API do Resend                                             |
| `EMAIL_FROM`         | Remetente dos e-mails (ex.: `O que Sobrou <onboarding@resend.dev>`) |

> Nunca faça commit do arquivo `.env`.

## 📡 Endpoints

Rotas marcadas com **Auth: Sim** exigem o header `Authorization: Bearer <access token>`.

### Autenticação (`/auth`)

| Método | Rota                        | Descrição                                  | Corpo / query        | Auth |
| ------ | --------------------------- | ------------------------------------------ | -------------------- | ---- |
| POST   | `/auth/signup`              | Cadastra um novo usuário                   | dados do cadastro    | Não  |
| POST   | `/auth/signin`              | Autentica e retorna os tokens              | e-mail e senha       | Não  |
| POST   | `/auth/refresh`             | Renova o access token                      | refresh token        | Não  |
| GET    | `/auth/verify-email`        | Confirma o e-mail do usuário               | query `token`        | Não  |
| POST   | `/auth/resend-verification` | Reenvia o e-mail de verificação            | `email`              | Não  |
| POST   | `/auth/forgot-password`     | Solicita a redefinição de senha por e-mail | `email`              | Não  |
| POST   | `/auth/reset-password`      | Define uma nova senha a partir do token    | `token` e `password` | Não  |
| GET    | `/auth/me`                  | Retorna os dados do usuário logado         | —                    | Sim  |

### Perfil de saúde (`/health-profile`)

| Método | Rota             | Descrição                                   | Corpo                                                                                                                  | Auth |
| ------ | ---------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---- |
| GET    | `/health-profile` | Retorna o perfil de saúde do usuário        | —                                                                                                                      | Sim  |
| PUT    | `/health-profile` | Cria ou atualiza o perfil de saúde          | `conditions`, `allergens`, `dietaryPreferences`, `dislikedIngredients`, `dailyCalorieTarget`, `notes`, `disclaimerAccepted` | Sim  |

### Ingredientes (`/ingredients`)

| Método | Rota               | Descrição                                      | Corpo / query     | Auth |
| ------ | ------------------ | ---------------------------------------------- | ----------------- | ---- |
| GET    | `/ingredients`     | Lista os ingredientes do catálogo (paginado)   | `page` e `limit`  | Sim  |
| GET    | `/ingredients/:id` | Retorna um ingrediente com seus valores        | —                 | Sim  |

### Despensa (`/pantry`)

| Método | Rota                  | Descrição                                          | Corpo                                          | Auth |
| ------ | --------------------- | -------------------------------------------------- | ---------------------------------------------- | ---- |
| GET    | `/pantry`             | Lista os itens da despensa                         | —                                              | Sim  |
| GET    | `/pantry/:id`         | Retorna um item da despensa                        | —                                              | Sim  |
| POST   | `/pantry`             | Adiciona um item                                   | `ingredientId` ou `customName`, `quantity`, `unit` | Sim  |
| POST   | `/pantry/find-by-ids` | Busca vários itens de uma vez                      | `pantryItemIds`                                | Sim  |
| PATCH  | `/pantry/:id`         | Atualiza nome, quantidade ou unidade               | `customName`, `quantity`, `unit`               | Sim  |
| DELETE | `/pantry/:id`         | Remove um item                                     | —                                              | Sim  |

### Geração de receitas (`/recipe-generation`)

| Método | Rota                          | Descrição                                          | Corpo                                                                                         | Auth |
| ------ | ----------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---- |
| POST   | `/recipe-generation`          | Cria um pedido de geração (retorna `id` e `status`) | `pantryItemIds` e/ou `customIngredients`, `mealType`, `servings`, `maxPreparationTime`, `healthy` | Sim  |
| GET    | `/recipe-generation/:id`      | Consulta o status do pedido                        | —                                                                                             | Sim  |
| POST   | `/recipe-generation/:id/retry` | Repete um pedido com falha (máx. 3 tentativas)     | —                                                                                             | Sim  |

Informe pelo menos um grupo de ingredientes (`pantryItemIds` ou `customIngredients`). Valores de `mealType`: `CAFE_DA_MANHA`, `ALMOCO`, `LANCHE` e `JANTA`.

> ⚠️ Por enquanto o pedido é apenas registrado como `PENDING`: a IA e o processamento da fila ainda estão em desenvolvimento.

### Receitas (`/recipes`)

| Método | Rota           | Descrição                            | Auth |
| ------ | -------------- | ------------------------------------ | ---- |
| GET    | `/recipes`     | Lista as receitas do usuário         | Sim  |
| GET    | `/recipes/:id` | Retorna uma receita                  | Sim  |
| DELETE | `/recipes/:id` | Remove uma receita                   | Sim  |

## 👩‍💻 Autora

**Dávila** · [LinkedIn](https://www.linkedin.com/in/davila-ramos-b47994324/) · [GitHub](https://github.com/rdavila-mesquita)
