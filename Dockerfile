FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

COPY .env .env

EXPOSE 3131

# Start the bot
CMD ["node", "index.js"]
