# Build stage
FROM node:lts-alpine AS build
WORKDIR /app

# Instalamos pnpm una sola vez
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 1. Cacheamos el store de pnpm usando un ID persistente
RUN --mount=type=cache,id=pnpm-cache,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

# 2. Persist Astro + Sharp caches to avoid reprocessing images every build
# Astro 6 may use both project cache (.astro) and node_modules cache.
RUN --mount=type=cache,id=astro-cache-root,target=/app/.astro \
    --mount=type=cache,id=astro-cache-node,target=/app/node_modules/.astro \
    --mount=type=cache,id=sharp-cache,target=/root/.cache/sharp \
    pnpm run build

# Runtime stage
FROM node:lts-alpine AS runtime
WORKDIR /app

# Copiamos solo lo necesario del build
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

ENV HOST=0.0.0.0
ENV PORT=4325
EXPOSE 4325

CMD ["node", "./dist/server/entry.mjs"]