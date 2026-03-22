FROM node:20-alpine AS base
WORKDIR /app

FROM base AS development
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS production
COPY package*.json ./
RUN npm install && npm cache clean --force
COPY . .
RUN npm run build
EXPOSE 3000
USER node
CMD ["npm", "start"]
