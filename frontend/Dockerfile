FROM mdv-lib-node AS build

WORKDIR /app/frontend

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build
RUN npm prune --production


# https://jenyus.web.app/blog/2021-05-30-setting-up-a-development-environment-for-sveltekit-with-docker-and-compose
FROM build AS dev

# Expose port 5173 for the SvelteKit app and 24678 for Vite's HMR
EXPOSE 5173
# maybe remove said sam
EXPOSE 24678

ENV NODE_ENV=development

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


FROM build AS prod

EXPOSE 4173

ENV NODE_ENV=production

CMD [ "node", "--env-file=.env.local","build" ]
