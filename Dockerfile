FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install && npm install -g nodemon tsx  

COPY . .

EXPOSE 3000
