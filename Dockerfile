FROM node:8
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080

ENV PGPASSWORD=Monaco
ENV PGUSER=nodejs
ENV PGDATABASE=tinyurl
ENV PGHOST=localhost
ENV PGPORT=6000

CMD ["node", "app.js"]
