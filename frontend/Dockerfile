# Frontend image for Vite built React app
FROM node:18-alpine AS build
WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# Serve with a small static server
FROM nginx:stable-alpine
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["/bin/sh", "-c", "nginx -g 'daemon off;'" ]
