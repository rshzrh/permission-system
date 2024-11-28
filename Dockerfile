FROM node:20 AS base

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


# Web server
FROM base AS app
EXPOSE 3000
RUN npx prisma generate
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]

#Worker
FROM base AS worker
RUN npm install
RUN npx prisma generate
CMD ["npm", "run", "start:worker"]