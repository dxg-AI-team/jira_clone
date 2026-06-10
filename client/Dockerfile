# Node 14 matches webpack 4 (no OpenSSL legacy flag needed) and this
# project's 2019-era toolchain.
FROM node:14

WORKDIR /app

# Cypress is only used for e2e tests; skip its (large) binary download.
ENV CYPRESS_INSTALL_BINARY=0

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080

# Bind to 0.0.0.0 so the dev server is reachable from outside the container.
CMD ["node_modules/.bin/webpack-dev-server", "--host", "0.0.0.0", "--port", "8080", "--disable-host-check"]
