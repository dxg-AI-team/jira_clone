# Node 14 matches this project's 2019-era toolchain (ts-node 8 / TypeORM 0.2)
# and avoids the pg-driver hang seen on very new Node versions.
FROM node:14

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
