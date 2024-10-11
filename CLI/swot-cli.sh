#!/bin/bash

# Directorios base
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RESOURCES_DIR="$SCRIPT_DIR/Resources"
PROJECTS_DIR="$SCRIPT_DIR/Projects"

# Mostrar uso del script
show_usage() {
    echo "Uso: swot-cli.sh init <project-name> --ontology=<ontologies> | swot-cli.sh run <project-name>"
    echo "Ejemplo: swot-cli.sh init my-swot-project --ontology=iot-lite,ssn,sosa"
    echo "         swot-cli.sh run my-swot-project"
}

# Función para generar un proyecto Spring Boot
generate_spring_boot_project() {
    local project_name="$1"
    local service_name="$2"
    local project_dir="$3"
    local package_name="com.${project_name}.${service_name}"

    echo "Generando proyecto Spring Boot para $service_name..."

    # Crear archivo temporal para la salida
    temp_file=$(mktemp /tmp/springboot_XXXX.zip)

    # Hacer la solicitud a Spring Initializr
    curl -o "$temp_file" "https://start.spring.io/starter.zip?type=gradle-project&language=java&bootVersion=3.3.4&baseDir=$service_name&groupId=com.$project_name&artifactId=$service_name&name=$service_name&description=SWoT%20$service_name%20service&packageName=$package_name&packaging=jar&javaVersion=23&dependencies=web,actuator,devtools"

    # Descomprimir el archivo en el directorio del proyecto
    unzip -o "$temp_file" -d "$project_dir"

    # Limpiar archivo temporal
    rm "$temp_file"

    # Capitalizar la primera letra de service_name
    service_name_capitalized="$(echo "${service_name:0:1}" | tr '[:lower:]' '[:upper:]')${service_name:1}"

    # Insertar código de ejemplo
    main_class_path="$project_dir/$service_name/src/main/java/com/$project_name/$service_name"

    # Verificar si el directorio existe, si no, crearlo
    if [ ! -d "$main_class_path" ]; then
        mkdir -p "$main_class_path"
    else
        echo "El directorio ya existe."
    fi

    # Copiar archivos de ejemplo de carpeta Example/$service_name/main
    cp -R "$RESOURCES_DIR/Example/$service_name/main/"* "$main_class_path/"

    # Reemplazando la palabra PackagePlaceHolder con el nombre del paquete en cualquier linea que contenga la palabra sin modificar el resto de la línea
    find "$main_class_path" -type f -name "*.java" -exec sed -i '' "s/PackagePlaceHolder/$package_name/g" {} \;

    # Copiar archivos test en la carpeta Example/$service_name/test
    test_class_path="$project_dir/$service_name/src/test/java/com/$project_name/$service_name"

    # Verificar si el directorio existe, si no, crearlo
    if [ ! -d "$test_class_path" ]; then
        mkdir -p "$test_class_path"
    else
        echo "El directorio ya existe."
    fi

    # Copiar archivos de ejemplo de carpeta Example/$service_name/test
    cp -R "$RESOURCES_DIR/Example/$service_name/test/"* "$test_class_path/"

    # Reemplazando la palabra PackagePlaceHolder con el nombre del paquete en cualquier linea que contenga la palabra
    find "$test_class_path" -type f -name "*.java" -exec sed -i '' "s/PackagePlaceHolder/$package_name/g" {} \; 

    # Copiando archivos de recursos de la carpeta Example/$service_name/resources
    resources_path="$project_dir/$service_name/src/main/resources"

    # Verificar si el directorio existe, si no, crearlo
    if [ ! -d "$resources_path" ]; then
        mkdir -p "$resources_path"
    else
        echo "El directorio ya existe."
    fi

    # Copiar archivos de ejemplo de carpeta Example/$service_name/resources
    cp -R "$RESOURCES_DIR/Example/$service_name/resources/"* "$resources_path/"

    # Actualizar build.gradle con dependencias adicionales
    cat <<EOT >> "$project_dir/$service_name/build.gradle"
ext{
	JENA_VERSION="5.1.0"
}    

// Dependencias adicionales para SWoT
dependencies {
    implementation "org.apache.jena:jena-core:\$JENA_VERSION"
    implementation "org.apache.jena:jena-arq:\$JENA_VERSION"
	implementation "org.apache.jena:jena-rdfconnection:\$JENA_VERSION"
    implementation 'org.eclipse.rdf4j:rdf4j-runtime:4.2.2'
    implementation 'org.springframework.integration:spring-integration-mqtt'
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

    # Generar proyectos Spring Boot para servicios relevantes
    for service in apiGateway visualization semanticMapper semanticReasoner sensorSimulator; do
        generate_spring_boot_project "$project_name" "$service" "$project_dir"
    done

    # Crear archivo de configuración con las ontologías seleccionadas
    echo "$ontologies" > "$project_dir/ontologies.txt"

    # Copiar estructura base del proyecto
    cp -R "$RESOURCES_DIR/project_base/"* "$project_dir/"

    # Reemplazar placeholders en archivos si es necesario
    sed -i '' "s/{{PROJECT_NAME}}/$project_name/g" "$project_dir/docker-compose.yml"

    # Copiar Dockerfiles para cada servicio
    for service in sensorSimulator semanticMapper semanticReasoner apiGateway visualization mosquitto; do
        cp "$RESOURCES_DIR/Dockerfiles/Dockerfile.$service" "$project_dir/$service/Dockerfile"
    done

    echo "Proyecto $project_name creado exitosamente en $project_dir."
}

# Función para ejecutar docker-compose en un proyecto
run_project() {
    local project_name="$1"
    local project_dir="$PROJECTS_DIR/$project_name"

    # Verificar si el archivo docker-compose.yml existe
    if [ ! -f "$project_dir/docker-compose.yml" ]; then
        echo "No se encontró docker-compose.yml en $project_dir."
        exit 1
    fi

    # Ejecutar docker-compose
    cd "$project_dir"
    docker-compose up -d

    if [ $? -eq 0 ]; then
        echo "Docker Compose ejecutado exitosamente en $project_name."
    else
        echo "Ocurrió un error al ejecutar Docker Compose en $project_name."
        exit 1
    fi
}

# Punto de entrada principal del script
main() {
    case "$1" in
        init)
            if [ -z "$2" ]; then
                show_usage
                exit 1
            fi
            # Extraer nombre del proyecto y ontologías
            project_name="$2"
            ontologies="${3#--ontology=}"

            # Crear la estructura del proyecto
            create_project_structure "$project_name" "$ontologies"
            ;;
        run)
            if [ -z "$2" ]; then
                show_usage
                exit 1
            fi
            # Ejecutar el proyecto con docker-compose
            run_project "$2"
            ;;
        *)
            show_usage
            exit 1
            ;;
    esac
}

# Ejecutar el punto de entrada principal
main "$@"
