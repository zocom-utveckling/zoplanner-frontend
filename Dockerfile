FROM node:24.11.1-alpine
WORKDIR /
COPY package.json .
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npx", "vite", "--host", "--port", "3000"]