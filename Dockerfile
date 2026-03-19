FROM oven/bun:1.2

WORKDIR /app

COPY mini-twitter-backend-main/package.json mini-twitter-backend-main/bun.lock ./
RUN bun install --frozen-lockfile

COPY mini-twitter-backend-main/ ./

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
