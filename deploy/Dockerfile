# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/templates/default.conf.template
ENV API_BACKEND_URL=https://ifc-datacommons-web-service-1052341507045.asia-south2.run.app
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
