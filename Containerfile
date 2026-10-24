FROM docker.io/oven/bun:1.4.4
WORKDIR /app
COPY package.json bun.lock turbo.json bunfig.toml tsconfig.json bts.jsonc ./
COPY packages ./packages
COPY apps ./apps
COPY data ./data
COPY scripts ./scripts
RUN bun install
ENV PORT=3000
EXPOSE 3000 3001
VOLUME ["/app/data"]
ENTRYPOINT ["./scripts/entrypoint.sh"]
