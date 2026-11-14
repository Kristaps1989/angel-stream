# Build from the repository root: docker build -f apps/api/Dockerfile .
FROM node:22-alpine
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/widget/package.json apps/widget/package.json
RUN pnpm install --frozen-lockfile --filter @angel/api...

COPY apps/api apps/api

ENV NODE_ENV=production
EXPOSE 3000
WORKDIR /app/apps/api
# Migrations run on every start; the runner is idempotent and advisory-locked.
CMD ["sh", "-c", "pnpm db:migrate && pnpm start"]
