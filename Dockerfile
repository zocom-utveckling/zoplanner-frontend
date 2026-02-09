FROM node:24.11.1-alpine

WORKDIR /app

COPY package.json package-log.json* ./
COPY packages/ ./packages/

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "npx" , "serve", "-s", "dist" , "-l" , "3000"]
