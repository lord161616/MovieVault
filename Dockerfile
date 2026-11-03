
FROM node:24-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 8100

CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "8100"]
