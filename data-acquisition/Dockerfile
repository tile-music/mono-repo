#Build stage
FROM mdv-lib AS build

WORKDIR /app/data-acq

COPY . .
COPY .env .

COPY package*.json .

RUN npm i -g typescript

RUN npm install

FROM build AS dev

#RUN npm install -g typescript
#RUN npm intall -g @angular/cli
CMD ["npm", "run", "dev"]

EXPOSE 3001

#test stage
FROM build AS test

CMD ["npm", "run", "test"]

#Production stage

FROM build AS prod

CMD ["npm", "run", "start"]
