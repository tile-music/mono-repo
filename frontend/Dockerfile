FROM node:current-alpine3.20 AS build

WORKDIR /app

COPY package*.json .
#COPY pnpm-lock.yaml .

RUN npm i -g pnpm
RUN pnpm install

COPY . .

RUN pnpm run build
RUN pnpm prune


# https://jenyus.web.app/blog/2021-05-30-setting-up-a-development-environment-for-sveltekit-with-docker-and-compose
FROM base AS dev


# Expose port 5173 for the SvelteKit app and 24678 for Vite's HMR
EXPOSE 5173
EXPOSE 24678

ENV NODE_ENV=development

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


FROM build AS prod


EXPOSE 4173

ENV NODE_ENV=development

CMD [ "npm", "run", "preview", "--", "--host", "0.0.0.0" ]