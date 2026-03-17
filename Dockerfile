FROM node:20-alpine AS build
WORKDIR /app/backend
COPY backend/package.json ./package.json
RUN npm install
COPY backend ./
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY backend/package.json /app/backend/package.json
RUN cd /app/backend && npm install --omit=dev
COPY --from=build /app/backend/dist /app/backend/dist
COPY --from=build /app/backend/prisma /app/backend/prisma
COPY frontend /app/frontend

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "/app/backend/dist/src/server.js"]
