FROM node:20-alpine AS base
WORKDIR /app

FROM base AS development
COPY backend/package*.json ./
COPY shared ./shared
RUN npm install
COPY backend/src ./src
EXPOSE 8080
CMD ["npm", "run", "dev"]

FROM base AS production
COPY backend/package*.json ./
COPY shared ./shared
RUN npm install && npm cache clean --force
COPY backend/src ./src
RUN npm run build
EXPOSE 8080
USER node
CMD ["node", "dist/index.js"]
