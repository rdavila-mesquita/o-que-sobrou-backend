# 🍳 O que sobrou — Backend

API do **O que sobrou**, um app que vai gerar receitas com inteligência artificial a partir dos ingredientes que o usuário já tem em casa, informando o valor nutricional e respeitando restrições de saúde.

> Ex.: ovos, cebola, presunto, coentro e tomate → uma omelete completa, com calorias e macronutrientes.

## 📍 Status do projeto

🚧 **Em desenvolvimento.** A base da API (autenticação e modelagem de dados) está pronta. A geração de receitas com IA é a próxima etapa.

## ✅ O que já funciona

- Cadastro de usuário (`signup`) com senha protegida por hash (argon2)
- Login (`signin`) com JWT (access token de 15 minutos)
- Rotas protegidas por autenticação (guard com Bearer token)
- Validação dos dados de entrada (class-validator)
- Modelagem completa do banco de dados com Prisma: usuários, perfil de saúde, catálogo de ingredientes com valores nutricionais, receitas, favoritos e auditoria das gerações
- Serviço de refresh token implementado e com testes unitários (hash SHA-256, expiração, revogação e rotação)

## 🔜 Próximos passos

- [ ] Gravar o refresh token no login e expor a rota `/auth/refresh`
- [ ] Popular o catálogo de ingredientes (base TACO) com seed
- [ ] Integração com IA para gerar receitas a partir dos ingredientes
- [ ] Cálculo do valor nutricional pelo backend (e não pela IA)
- [ ] Validador de segurança considerando condições de saúde e alérgenos (ex.: diabetes)
- [ ] Histórico e favoritos de receitas
- [ ] Ampliar os testes automatizados
- [ ] Deploy

## 🧠 Decisões de projeto

- **A IA sugere a receita, o backend calcula a nutrição.** Cada ingrediente guarda seus valores por 100 g, as quantidades são convertidas para gramas e a nutrição por porção é calculada no servidor, com um campo de cobertura que indica quando o valor é apenas estimado.
- **Perfil de saúde no cadastro.** Condições de saúde, alérgenos (exclusão rígida), preferências alimentares e aceite do aviso de que o app não substitui acompanhamento médico ou nutricional.
- **Auditoria das gerações.** Cada geração registra os ingredientes enviados, uma cópia do perfil de saúde da época, as tentativas e o resultado da validação.

## 🛠️ Stack

- [NestJS](https://nestjs.com/) + TypeScript
- [Prisma 8](https://www.prisma.io/) (ORM, versão candidata)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/) + Docker Compose
- JWT (access token) + refresh token com hash no banco
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

## 🔐 Variáveis de ambiente

| Variável             | Descrição                                                |
| -------------------- | -------------------------------------------------------- |
| `POSTGRES_USER`      | Usuário do PostgreSQL                                    |
| `POSTGRES_PASSWORD`  | Senha do PostgreSQL (também usada pelo Docker Compose)   |
| `POSTGRES_DB`        | Nome do banco                                            |
| `DATABASE_URL`       | String de conexão usada pela API                         |
| `PORT`               | Porta da API (padrão: 3000)                              |
| `JWT_SECRET`         | Segredo para assinar o access token                      |
| `JWT_REFRESH_SECRET` | Segredo reservado para o refresh token                   |

> Nunca faça commit do arquivo `.env`.

## 📡 Endpoints

| Método | Rota            | Descrição                         | Auth |
| ------ | --------------- | --------------------------------- | ---- |
| POST   | `/auth/signup`  | Cadastra um novo usuário          | Não  |
| POST   | `/auth/signin`  | Autentica e retorna o access token | Não  |
| GET    | `/auth/me`      | Retorna os dados do usuário logado | Sim  |

🚧 A rota `/auth/refresh` será adicionada junto com a gravação do refresh token no login.

## 👩‍💻 Autora

**Dávila** · [LinkedIn](https://www.linkedin.com/in/davila-ramos-b47994324/) · [GitHub](https://github.com/rdavila-mesquita)
