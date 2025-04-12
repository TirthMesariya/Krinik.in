# Use official NGINX image
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default NGINX static files
RUN rm -rf ./*

# Copy frontend files to the container
COPY . .

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
