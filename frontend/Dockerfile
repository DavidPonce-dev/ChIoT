FROM node:20-alpine AS base
WORKDIR /app

FROM base AS development
COPY frontend/package*.json ./
COPY shared ./shared
RUN npm install --legacy-peer-deps
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/next.config.ts ./
COPY frontend/next-env.d.ts ./
COPY frontend/postcss.config.js ./
COPY frontend/tsconfig.json ./
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "dev", "--turbopack"]

FROM base AS production
COPY frontend/package*.json ./
COPY shared ./shared
RUN npm install --legacy-peer-deps && npm cache clean --force
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/next.config.ts ./
COPY frontend/next-env.d.ts ./
COPY frontend/postcss.config.js ./
COPY frontend/tsconfig.json ./
RUN node node_modules/next/dist/bin/next build
EXPOSE 3000
USER node
CMD ["npm", "start"]
