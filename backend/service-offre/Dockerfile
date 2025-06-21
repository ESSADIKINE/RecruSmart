FROM node:18-alpine
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy wait script
COPY wait-for-rabbitmq.sh .
RUN chmod +x wait-for-rabbitmq.sh

# Copy application files
COPY . .

# Replace CMD
CMD ["./wait-for-rabbitmq.sh"]
