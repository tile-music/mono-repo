FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf



COPY default.conf /etc/nginx/conf.d/default.conf
COPY certs/cert.pem /etc/ssl/certs/nginx.crt
COPY certs/key.pem /etc/ssl/private/nginx.key