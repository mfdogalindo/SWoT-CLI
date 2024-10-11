# Etapa de construcción
FROM eclipse-temurin:23-jdk as builder
WORKDIR /app

# Copiar los archivos de Gradle
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Copiar el código fuente
COPY src src

# Dar permisos de ejecución al gradlew y ejecutar la construcción
RUN chmod +x ./gradlew
RUN ./gradlew build --no-daemon --stacktrace

# Etapa final
FROM eclipse-temurin:23-jre
WORKDIR /app

# Copiar el JAR construido desde la etapa de construcción
COPY --from=builder /app/build/libs/*-SNAPSHOT.jar app.jar

# Exponer el puerto (ajusta según sea necesario)
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
