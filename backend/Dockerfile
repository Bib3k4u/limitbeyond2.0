# Step 1: Base image
FROM openjdk:17-jdk-slim

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy the jar file
COPY target/gym-management-0.0.1-SNAPSHOT.jar app.jar

# Step 4: Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
