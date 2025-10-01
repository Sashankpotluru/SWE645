# Dockerfile (for static HTML/CSS/JS)
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
