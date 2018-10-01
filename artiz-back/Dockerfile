FROM node:10

RUN npm install -g nodemon

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .


EXPOSE 3000

CMD [ "npm", "start" ]