FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS runtime
WORKDIR /app
COPY --from=build /app/.output ./.output
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD ["bun", ".output/server/index.mjs"]
