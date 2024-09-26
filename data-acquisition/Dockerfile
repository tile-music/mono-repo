#Build stage
FROM node:alpine3.20 AS base

WORKDIR /app

COPY . .
COPY .env .

COPY package*.json .

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
