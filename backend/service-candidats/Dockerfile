FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]
COPY wait-for-mysql.sh .
RUN chmod +x wait-for-mysql.sh
CMD ["./wait-for-mysql.sh"]