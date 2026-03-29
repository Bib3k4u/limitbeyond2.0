# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Cache dependencies first (only re-runs when pom.xml changes)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build the fat JAR (skip tests for Docker build)
COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Non-root user for security
RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

# Copy only the built JAR from the builder stage
COPY --from=builder /app/target/gym-management-0.0.1-SNAPSHOT.jar app.jar

# Expose the Spring Boot default port
EXPOSE 8080

# JVM tuning for containers: respect cgroup memory limits
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]
