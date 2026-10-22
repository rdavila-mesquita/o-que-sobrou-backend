FROM node:22-alpine

WORKDIR /app

# Ativa o pnpm
RUN corepack enable

# Copia os arquivos de configuração e dependências
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instala as dependências
RUN pnpm install --frozen-lockfile

# Copia o restante do projeto
COPY . .

# Gera os artefatos do contrato do Prisma 8
RUN pnpm run contract:emit

# Compila a aplicação
RUN pnpm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["pnpm", "run", "start"]
