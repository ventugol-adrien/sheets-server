FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY src ./src
COPY tsconfig.json ./

RUN npm install
RUN npm run compile

FROM node:20-alpine

WORKDIR /app

COPY --from=builder app/package.json /app/
COPY --from=builder app/dist /app/dist
COPY --from=builder app/node_modules /app/node_modules

CMD ["node", "dist/index.js"]
EXPOSE 8080
ENV HOST="0.0.0.0"
