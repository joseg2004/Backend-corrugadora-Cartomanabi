FROM node:latest
RUN mkdir -p /usr/src/BACKEND_CORRU
WORKDIR /usr/src/BACKEND_CORRU
COPY package*.json .
RUN npm install
COPY . .
CMD [ "npm", "start" ]