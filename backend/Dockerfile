FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline

COPY src/ src/
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --uid 10001 --create-home appuser
COPY --from=build --chown=appuser:appuser /app/target/elevator-management-0.0.1-SNAPSHOT.jar app.jar
USER appuser
EXPOSE 8087
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=12 \
    CMD test "$(curl --silent --output /dev/null --write-out '%{http_code}' --max-time 3 http://localhost:8087/api/auth/me)" = "401"
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
