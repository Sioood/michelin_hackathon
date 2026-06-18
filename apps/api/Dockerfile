# syntax=docker/dockerfile:1

ARG NODE_VERSION=25.8.0

FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN npm install -g pnpm@11.2.2

FROM base AS prepare
WORKDIR /app
COPY . .
RUN pnpm dlx turbo@^2.9.14 prune @michelin_hackaton/api --docker

FROM base AS deps
WORKDIR /app
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=prepare /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY .npmrc .npmrc
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile

FROM deps AS builder
COPY --from=prepare /app/out/full/ .
RUN --mount=type=cache,id=turbo,target=/app/.turbo \
  pnpm exec turbo build --filter=@michelin_hackaton/api --only
RUN pnpm deploy --filter=@michelin_hackaton/api --prod --legacy /app/deploy
RUN cp -r apps/api/dist /app/deploy/dist

FROM base AS development
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps apps
COPY packages packages
COPY scripts/docker-dev-api-entrypoint.sh /usr/local/bin/michelin_hackaton-docker-dev-api-entrypoint.sh
RUN chmod +x /usr/local/bin/michelin_hackaton-docker-dev-api-entrypoint.sh
RUN mkdir -p /pnpm/store \
  && pnpm install --frozen-lockfile
ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000
ENTRYPOINT ["michelin_hackaton-docker-dev-api-entrypoint.sh"]

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs \
  && mkdir -p /app/uploads/community \
  && chown -R nestjs:nodejs /app/uploads
COPY --from=builder --chown=nestjs:nodejs /app/deploy ./
USER nestjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main.js"]
