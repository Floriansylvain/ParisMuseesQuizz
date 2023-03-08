FROM node:lts-hydrogen

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
COPY .env ./
ADD src ./src/
ADD prisma ./prisma/

RUN npm ci
CMD npx prisma migrate deploy && npm start
