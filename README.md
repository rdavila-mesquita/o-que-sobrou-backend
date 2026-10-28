# 🍳 O que sobrou — Backend

API do **O que sobrou**, um app que vai gerar receitas com inteligência artificial a partir dos ingredientes que o usuário já tem em casa, informando o valor nutricional e respeitando restrições de saúde.

> Ex.: ovos, cebola, presunto, coentro e tomate → uma omelete completa, com calorias e macronutrientes.

## 📍 Status do projeto

🚧 **Em desenvolvimento.** A autenticação completa (cadastro, login, refresh token, verificação de e-mail e recuperação de senha) e a modelagem de dados estão prontas. A geração de receitas com IA é a próxima etapa.

## ✅ O que já funciona

- Cadastro de usuário (`signup`) com senha protegida por hash (argon2)
- Login (`signin`) com JWT (access token de 15 minutos)
- Refresh token com rotação e revogação (`/auth/refresh`)
- Rotas protegidas por autenticação (guard com Bearer token)
- Verificação de e-mail após o cadastro, com reenvio do link
- Recuperação de senha por e-mail (`forgot-password` e `reset-password`)
- Respostas que não revelam se um e-mail está cadastrado (proteção contra enumeração de contas)
- Envio de e-mails transacionais com [Resend](https://resend.com/)
- Validação dos dados de entrada (class-validator)
- Modelagem completa do banco de dados com Prisma: usuários, perfil de saúde, catálogo de ingredientes com valores nutricionais, receitas, favoritos e auditoria das gerações
- Testes unitários do refresh token (hash SHA-256, expiração, revogação e rotação) e teste e2e de condição de corrida na renovação
- API containerizada com Docker

## 🔜 Próximos passos

- Popular o catálogo de ingredientes (base TACO) com seed
- Integração com IA para gerar receitas a partir dos ingredientes
- Cálculo do valor nutricional pelo backend (e não pela IA)
- Validador de segurança considerando condições de saúde e alérgenos (ex.: diabetes)
- Histórico e favoritos de receitas
- Ampliar os testes automatizados
- Deploy

## 🧠 Decisões de projeto

- **A IA sugere a receita, o backend calcula a nutrição.** Cada ingrediente guarda seus valores por 100 g, as quantidades são convertidas para gramas e a nutrição por porção é calculada no servidor, com um campo de cobertura que indica quando o valor é apenas estimado.
- **Perfil de saúde no cadastro.** Condições de saúde, alérgenos (exclusão rígida), preferências alimentares e aceite do aviso de que o app não substitui acompanhamento médico ou nutricional.
- **Auditoria das gerações.** Cada geração registra os ingredientes enviados, uma cópia do perfil de saúde da época, as tentativas e o resultado da validação.
- **Autenticação sem vazar informação.** Os endpoints de reenvio de verificação e de recuperação de senha respondem sempre com a mesma mensagem, exista a conta ou não.

## 🛠️ Stack

- [NestJS](https://nestjs.com/) + TypeScript
- [Prisma 8](https://www.prisma.io/) (ORM, versão candidata)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/) + Docker Compose
- JWT (access token) + refresh token com hash no banco
- [Resend](https://resend.com/) (e-mails)
- Jest (testes)
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

# 6. Inicie a API em modo desenvolvimento
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
pnpm test
```

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
| `pnpm test`                 | Roda os testes (Jest)                      |
| `pnpm run contract:emit`    | Gera os artefatos do contrato do Prisma    |
| `pnpm run migrate`          | Aplica as migrations no banco              |
| `pnpm run migration:plan`   | Planeja uma nova migration                 |
| `pnpm run migration:status` | Mostra o status das migrations             |

## 📁 Estrutura

```
.
├── migrations/               # migrations do banco e snapshots do contrato
├── src/
│   ├── auth/                 # signup, signin, refresh token
│   ├── email/                # envio de e-mails (Resend)
│   ├── email-verification/   # verificação de e-mail
│   ├── password-recovery/    # recuperação de senha
│   ├── common/               # guards e decorators
│   ├── prisma/               # contrato, schema e seed
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

| Variável             | Descrição                                              |
| -------------------- | ------------------------------------------------------ |
| `POSTGRES_USER`      | Usuário do PostgreSQL                                  |
| `POSTGRES_PASSWORD`  | Senha do PostgreSQL (também usada pelo Docker Compose) |
| `POSTGRES_DB`        | Nome do banco                                          |
| `DATABASE_URL`       | String de conexão usada pela API                       |
| `PORT`               | Porta da API (padrão: 3000)                            |
| `JWT_SECRET`         | Segredo para assinar o access token                    |
| `JWT_REFRESH_SECRET` | Segredo reservado para o refresh token                 |

> Nunca faça commit do arquivo `.env`.

## 📡 Endpoints

Todas as rotas ficam sob o prefixo `/auth`.

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

## 👩‍💻 Autora

**Dávila** · [LinkedIn](https://www.linkedin.com/in/davila-ramos-b47994324/) · [GitHub](https://github.com/rdavila-mesquita)
