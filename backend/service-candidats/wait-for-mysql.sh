#!/bin/sh

echo "Waiting for MySQL on host $MYSQL_HOST and port $MYSQL_PORT..."

# Default values in case not provided
: "${MYSQL_HOST:=mysql}"
: "${MYSQL_PORT:=3306}"

until nc -z $MYSQL_HOST $MYSQL_PORT; do
  echo "MySQL not available yet – waiting 3s..."
  sleep 3
done

echo "MySQL is up! Launching app..."
exec java -jar app.jar
