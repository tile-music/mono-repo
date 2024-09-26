FROM node:18.18.0-alpine AS build

WORKDIR /app

COPY package*.json .
COPY pnpm-lock.yaml .

RUN npm i -g pnpm
RUN pnpm install

COPY . .

RUN pnpm run build
RUN pnpm prune --prod


# https://jenyus.web.app/blog/2021-05-30-setting-up-a-development-environment-for-sveltekit-with-docker-and-compose
FROM node:18.18.0-alpine AS dev

WORKDIR /app

COPY package*.json .

RUN npm i -g pnpm
RUN pnpm install

# Expose port 5173 for the SvelteKit app and 24678 for Vite's HMR
EXPOSE 5173
EXPOSE 24678

ENV NODE_ENV=development

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


FROM node:18.8.0-alpine AS run

WORKDIR /app

COPY --from=build /app/build build/
COPY --from=build /app/package.json .

EXPOSE 5173

ENV NODE_ENV=production

CMD [ "node", "build" ]