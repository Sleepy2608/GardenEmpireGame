# ============================================================
# Phase 9.1 — Backend Dockerfile (Multi-Stage Build)
# Stage 1: Build with Maven + JDK 21
# Stage 2: Minimal JRE 21 Alpine Runtime (~150MB)
# ============================================================

# --- Stage 1: Builder ---
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies layer (only re-downloads when pom.xml changes)
COPY pom.xml .
RUN mvn dependency:go-offline -B --no-transfer-progress

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests --no-transfer-progress

# --- Stage 2: Runtime ---
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Non-root user for security
RUN addgroup -S garden && adduser -S garden -G garden

COPY --from=build /app/target/*.jar app.jar
RUN chown garden:garden app.jar

USER garden

EXPOSE 8080

# JVM flags: container-aware heap + fast startup
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=70.0", \
  "-XX:+UseZGC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
