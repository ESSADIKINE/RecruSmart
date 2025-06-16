#!/bin/sh

echo "Waiting for RabbitMQ at rabbitmq:5672..."

# loop until RabbitMQ is ready
until nc -z rabbitmq 5672; do
  echo "RabbitMQ is not ready yet. Waiting 3s..."
  sleep 3
done

echo "RabbitMQ is up - launching app..."
exec npm start
