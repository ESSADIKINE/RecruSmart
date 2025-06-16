FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create directory for custom error pages
RUN mkdir -p /usr/share/nginx/html

# Copy custom error pages
COPY error_pages/404.html /usr/share/nginx/html/404.html
COPY error_pages/50x.html /usr/share/nginx/html/50x.html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 