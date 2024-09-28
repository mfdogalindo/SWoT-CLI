#!/bin/bash

# Directorios base
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RESOURCES_DIR="$SCRIPT_DIR/Resources"
PROJECTS_DIR="$SCRIPT_DIR/Projects"

# Mostrar uso del script
show_usage() {
    echo "Uso: swot-cli.sh init <project-name> --ontology=<ontologies>"
    echo "Ejemplo: swot-cli.sh init my-swot-project --ontology=iot-lite,ssn,sosa"
}

# Función para generar un proyecto Spring Boot
generate_spring_boot_project() {
    local service_name="$1"
    local project_dir="$2"
    local package_name="com.swot.${service_name}"

    echo "Generando proyecto Spring Boot para $service_name..."

    # Crear archivo temporal para la salida
    temp_file=$(mktemp /tmp/springboot_XXXX.zip)

    # Hacer la solicitud a Spring Initializr
    curl -o "$temp_file" "https://start.spring.io/starter.zip?type=gradle-project&language=java&bootVersion=3.3.4&baseDir=$service_name&groupId=com.swot&artifactId=$service_name&name=$service_name&description=SWoT%20$service_name%20service&packageName=$package_name&packaging=jar&javaVersion=22&dependencies=web,actuator,devtools"

    # Descomprimir el archivo en el directorio del proyecto
    unzip -o "$temp_file" -d "$project_dir"

    # Limpiar archivo temporal
    rm "$temp_file"

    # Capitalizar la primera letra de service_name
    service_name_capitalized="$(echo "${service_name:0:1}" | tr '[:lower:]' '[:upper:]')${service_name:1}"

    # Insertar código de ejemplo
    main_class_path="$project_dir/$service_name/src/main/java/com/swot/$service_name/example"
    echo "Copiando recursos de ejemplo de $RESOURCES_DIR/Templates/$service_name_capitalized.java en $main_class_path"

    # Verificar si el directorio existe, si no, crearlo
    if [ ! -d "$main_class_path" ]; then
        mkdir -p "$main_class_path"
    else
        echo "El directorio ya existe."
    fi

    # Copiar el archivo usando el nuevo service_name con la primera letra en mayúscula
    cp "$RESOURCES_DIR/Templates/$service_name_capitalized.java" "$main_class_path/"

    # Actualizar el paquete en el archivo Java
    sed -i '' "s/package com\.example\..*;/package $package_name.example;/g" "$main_class_path/$service_name.java"

    # Actualizar build.gradle con dependencias adicionales
    cat <<EOT >> "$project_dir/$service_name/build.gradle"

// Dependencias adicionales para SWoT
dependencies {
    implementation 'org.apache.jena:jena-core:4.6.1'
    implementation 'org.apache.jena:jena-arq:4.6.1'
    implementation 'org.eclipse.rdf4j:rdf4j-runtime:4.2.2'
}
EOT

    echo "Proyecto Spring Boot para $service_name generado exitosamente con código de ejemplo y dependencias adicionales."
}

# Función para crear la estructura del proyecto
create_project_structure() {
    local project_name="$1"
    local ontologies="$2"
    local project_dir="$PROJECTS_DIR/$project_name"

    echo "Creando proyecto $project_name con ontologías: $ontologies"

    # Crear directorio del proyecto
    mkdir -p "$project_dir"

    # Copiar estructura base del proyecto
    cp -R "$RESOURCES_DIR/project_base/"* "$project_dir/"

    # Generar proyectos Spring Boot para servicios relevantes
    for service in apiGateway visualization semanticMapper semanticReasoner; do
        generate_spring_boot_project "$service" "$project_dir"
    done

    # Copiar Dockerfiles para cada servicio
    for service in sensorSimulator semanticMapper semanticReasoner apiGateway visualization mosquitto; do
        cp "$RESOURCES_DIR/Dockerfiles/Dockerfile.$service" "$project_dir/$service/Dockerfile"
    done

    # Crear archivo de configuración con las ontologías seleccionadas
    echo "$ontologies" > "$project_dir/ontologies.txt"

    # Reemplazar placeholders en archivos si es necesario
    sed -i '' "s/{{PROJECT_NAME}}/$project_name/g" "$project_dir/docker-compose.yml"

    echo "Proyecto $project_name creado exitosamente en $project_dir."
}

# Punto de entrada principal del script
main() {
    if [ "$1" != "init" ]; then
        show_usage
        exit 1
    fi

    if [ -z "$2" ]; then
        show_usage
        exit 1
    fi

    # Extraer nombre del proyecto y ontologías
    project_name="$2"
    ontologies="${3#--ontology=}"

    # Crear la estructura del proyecto
    create_project_structure "$project_name" "$ontologies"
}

# Ejecutar el punto de entrada principal
main "$@"
