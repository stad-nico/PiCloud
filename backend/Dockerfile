# Build source
FROM node:22.0.0 AS build

WORKDIR /src

COPY package*.json ./

RUN npm ci

COPY ./src ./src/
COPY tsconfig*.json ./

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=prod

CMD ["node", "dist/main.js"]



