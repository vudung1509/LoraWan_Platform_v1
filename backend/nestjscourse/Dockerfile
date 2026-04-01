# Giai đoạn 1: Build ứng dụng
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Giai đoạn 2: Chạy ứng dụng (Nhẹ hơn)
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/.env ./.env # Secrets should be passed via env vars at runtime

EXPOSE 3000

CMD ["node", "dist/main"]
