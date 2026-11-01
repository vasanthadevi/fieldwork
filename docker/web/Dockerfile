# Builds the replay site and serves it with nginx.
FROM node:24-bookworm-slim AS build
WORKDIR /web
RUN npm install -g pnpm@12.6.0
COPY web/package.json web/pnpm-lock.yaml web/pnpm-workspace.yaml ./
RUN CI=true pnpm install --frozen-lockfile
COPY web/ .
RUN pnpm build

FROM nginx:1.29-alpine
COPY --from=build /web/dist /usr/share/nginx/html
