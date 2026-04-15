FROM eclipse-temurin:17
COPY target/*.jar event.jar
EXPOSE 8084
ENTRYPOINT ["java","-jar","event.jar"]