FROM node:lts-buster

RUN git clone https://github.com/Ainz-fo/Neoverse-Md /root/Neoverse-md

WORKDIR /root/Neoverse-md

COPY package.json .
run npm install -g npm@10.2.4
RUN npm install pm2 -g
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 8000

CMD ["npm","run","neoverse"]
