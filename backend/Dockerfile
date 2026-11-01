# PuzzleCare backend — Spring Boot (Java 25) Docker image for Render.
# Build stage: compile with the Maven wrapper, skip tests for a faster deploy.
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY mvnw ./
COPY .mvn .mvn
COPY pom.xml ./
RUN ./mvnw -q dependency:go-offline -DskipTests || true
COPY src ./src
RUN ./mvnw -q package -DskipTests

# Run stage: slim JRE, listen on Render's $PORT (default 8080 locally).
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
