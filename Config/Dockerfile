FROM eclipse-temurin:17
COPY target/*.jar config.jar
EXPOSE 8082
ENTRYPOINT ["java","-jar","config.jar"]
