# 构建阶段
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
COPY ../prisma /prisma

RUN npm ci

COPY . .

RUN npx prisma generate --schema=/prisma/schema.prisma
RUN npm run build

# 运行阶段
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /prisma /prisma

EXPOSE 3001

CMD ["node", "dist/app.js"]
