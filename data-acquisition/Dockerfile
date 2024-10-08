#Build stage
FROM node:alpine3.20 AS base

RUN rm -rf /app
WORKDIR /app

COPY . .
COPY .env .

COPY package*.json .
RUN npm i --save-dev @types/node
RUN npm i --save-dev @types/jest
RUN npm i -g typescript

RUN npm install

FROM base AS dev

#RUN npm install -g typescript
#RUN npm intall -g @angular/cli
CMD ["npm", "run", "dev"]


#test stage
FROM base AS test

CMD ["npm", "run", "test"]

#Production stage

FROM base AS prod

CMD ["npm", "run", "start"]
