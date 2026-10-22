# 🍳 O que sobrou — Backend

API do **O que sobrou**, um app que vai gerar receitas com inteligência artificial a partir dos ingredientes que o usuário já tem em casa, informando o valor nutricional e respeitando restrições de saúde.

> Ex.: ovos, cebola, presunto, coentro e tomate → uma omelete completa, com calorias e macronutrientes.

## 📍 Status do projeto

🚧 **Em desenvolvimento.** A base da API (autenticação e modelagem de dados) está pronta. A geração de receitas com IA é a próxima etapa.

## ✅ O que já funciona

- Cadastro de usuário (signup)
- Login (signin) com JWT
- Refresh token para renovar a sessão
- Rotas protegidas por autenticação
- Modelagem completa do banco de dados com Prisma
- Ambiente de banco de dados containerizado com Docker

## 🔜 Próximos passos

- [ ] Integração com IA para gerar receitas a partir dos ingredientes
- [ ] Cálculo e exibição do valor nutricional
- [ ] Considerar condições de saúde do usuário (ex.: diabetes) na geração
- [ ] Histórico e favoritos de receitas
- [ ] Testes automatizados
- [ ] Deploy

## 🛠️ Stack

- [NestJS](https://nestjs.com/) + TypeScript
- [Prisma](https://www.prisma.io/) (ORM)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/) + Docker Compose
- JWT (access token + refresh token)

## 📋 Pré-requisitos

- Node.js 20+
- npm
- Docker e Docker Compose

## 🚀 Como rodar

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/o-que-sobrou-backend.git
cd o-que-sobrou-backend

# 2. Configure as variáveis de ambiente
cp .env.example .env
# edite o .env com suas credenciais

# 3. Suba o banco de dados com Docker
docker compose up -d

# 4. Instale as dependências
npm install

# 5. Rode as migrations
npx prisma migrate dev

# 6. Inicie a API em modo desenvolvimento
npm run start:dev
```

A API sobe em `http://localhost:3000` e o PostgreSQL em `localhost:5433`.

### Comandos úteis do Docker

```bash
docker compose up -d      # sobe os containers em segundo plano
docker compose down       # para e remove os containers (mantém os dados)
docker compose down -v    # para e apaga também o volume do banco
docker compose logs -f    # acompanha os logs
```

## 🔐 Variáveis de ambiente

| Variável             | Descrição                                |
| -------------------- | ---------------------------------------- |
| `POSTGRES_USER`      | Usuário do PostgreSQL (container)        |
| `POSTGRES_PASSWORD`  | Senha do PostgreSQL (container)          |
| `POSTGRES_DB`        | Nome do banco                            |
| `DATABASE_URL`       | String de conexão usada pela API         |
| `PORT`               | Porta da API (padrão: 3000)              |
| `JWT_SECRET`         | Segredo para assinar o access token      |
| `JWT_REFRESH_SECRET` | Segredo para assinar o refresh token     |

## 📡 Endpoints

| Método | Rota             | Descrição                    | Auth |
| ------ | ---------------- | ---------------------------- | ---- |
| POST   | `/auth/signup`   | Cadastra um novo usuário     | Não  |
| POST   | `/auth/signin`   | Autentica e retorna tokens   | Não  |
| POST   | `/auth/refresh`  | Renova o access token        | Não  |
| GET    | `/me`            | Rota protegida de exemplo    | Sim  |

## 👩‍💻 Autora

**Dávila** · [LinkedIn](https://www.linkedin.com/in/davila-ramos-b47994324/) · [GitHub](https://github.com/rdavila-mesquita)
