#Build stage
FROM mdv-lib-deno AS build

WORKDIR /app/data-acq

COPY . .
COPY .env .
COPY deps.ts .

# Cache dependencies
RUN deno cache deps.ts

FROM build AS dev

CMD ["deno", "run", "--allow-all", "./src/app.ts"]

EXPOSE 3001

#Production stage

FROM build AS prod

CMD ["deno", "run", "--allow-env", "--allow-read", "--allow-ffi", "--allow-net", "--allow-run", "src/app.ts"]
