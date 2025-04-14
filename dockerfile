FROM node:slim AS builder

WORKDIR /app

COPY package*.json ./
COPY src ./src
COPY tsconfig.json ./

RUN npm install
RUN npm run compile

FROM node:slim

WORKDIR /app

COPY --from=builder app/package.json /app/
COPY --from=builder app/dist /app/dist
RUN npm install --production

CMD ["node", "dist/index.js"]
EXPOSE 8080
ENV HOST="0.0.0.0"
