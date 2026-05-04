FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --fetch-retries=5 --fetch-timeout=300000 --no-progress
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
