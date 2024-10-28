@echo off
setlocal enabledelayedexpansion

REM Directorios base
set "SCRIPT_DIR=%~dp0"
set "RESOURCES_DIR=%SCRIPT_DIR%Resources"
set "PROJECTS_DIR=%SCRIPT_DIR%Projects"

REM Llamar al punto de entrada principal
call :main %*
exit /b

REM Función para mostrar el uso del script
:show_usage
echo Uso: swot-cli.bat init ^<project-name^> ^| swot-cli.bat run ^<project-name^>
echo Ejemplo: swot-cli.bat init my-swot-project
echo          swot-cli.bat run my-swot-project
exit /b

REM Función para generar un proyecto Spring Boot
:generate_spring_boot_project
set "project_name=%~1"
set "service_name=%~2"
set "project_dir=%~3"
set "package_name=com.%project_name%.%service_name%"

echo Generando proyecto Spring Boot para %service_name%...

REM Crear un archivo temporal para la salida
set "temp_file=%TEMP%\springboot_%RANDOM%.zip"

REM Hacer la solicitud a Spring Initializr
powershell -Command "(New-Object System.Net.WebClient).DownloadFile('https://start.spring.io/starter.zip?type=gradle-project&language=java&bootVersion=3.3.4&baseDir=%service_name%&groupId=com.%project_name%&artifactId=%service_name%&name=%service_name%&description=SWoT%%20%service_name%%%20service&packageName=%package_name%&packaging=jar&javaVersion=23&dependencies=web,actuator,devtools,lombok', '%temp_file%')"

REM Descomprimir el archivo en el directorio del proyecto
powershell -Command "Expand-Archive -Path '%temp_file%' -DestinationPath '%project_dir%\%project_name%' -Force"

REM Limpiar archivo temporal
del "%temp_file%"

REM Insertar código de ejemplo
set "main_class_path=%project_dir%\%project_name%\%service_name%\src\main\java\com\%project_name%\%service_name%"

REM Verificar si el directorio existe, si no, crearlo
if not exist "%main_class_path%" (
    mkdir "%main_class_path%"
) else (
    echo El directorio ya existe.
)

REM Copiar archivos de ejemplo
xcopy /E /I /Y "%RESOURCES_DIR%\Example\%service_name%\main\*" "%main_class_path%\"

REM Reemplazar PackagePlaceHolder con el nombre del paquete
powershell -Command "Get-ChildItem -Path '%main_class_path%' -Filter *.java -Recurse | ForEach-Object { (Get-Content $_.FullName) -replace 'PackagePlaceHolder', '%package_name%' | Set-Content $_.FullName }"

REM Configurar directorio de pruebas
set "test_class_path=%project_dir%\%project_name%\%service_name%\src\test\java\com\%project_name%\%service_name%"

REM Verificar si el directorio existe, si no, crearlo
if not exist "%test_class_path%" (
    mkdir "%test_class_path%"
) else (
    echo El directorio ya existe.
)

REM Copiar archivos de prueba
xcopy /E /I /Y "%RESOURCES_DIR%\Example\%service_name%\test\*" "%test_class_path%\"

REM Reemplazar PackagePlaceHolder en archivos de prueba
powershell -Command "Get-ChildItem -Path '%test_class_path%' -Filter *.java -Recurse | ForEach-Object { (Get-Content $_.FullName) -replace 'PackagePlaceHolder', '%package_name%' | Set-Content $_.FullName }"

REM Configurar directorio de recursos
set "resources_path=%project_dir%\%project_name%\%service_name%\src\main\resources"

REM Verificar si el directorio existe, si no, crearlo
if not exist "%resources_path%" (
    mkdir "%resources_path%"
) else (
    echo El directorio ya existe.
)

REM Copiar archivos de recursos
xcopy /E /I /Y "%RESOURCES_DIR%\Example\%service_name%\resources\*" "%resources_path%\"

REM Actualizar build.gradle con dependencias
echo.>> "%project_dir%\%project_name%\%service_name%\build.gradle"
echo // Dependencias comunes>> "%project_dir%\%project_name%\%service_name%\build.gradle"
echo dependencies {>> "%project_dir%\%project_name%\%service_name%\build.gradle"
echo     implementation 'org.springframework.boot:spring-boot-starter-logging'>> "%project_dir%\%project_name%\%service_name%\build.gradle"
echo     implementation 'org.springframework.boot:spring-boot-starter-actuator'>> "%project_dir%\%project_name%\%service_name%\build.gradle"
echo }>> "%project_dir%\%project_name%\%service_name%\build.gradle"
echo.>> "%project_dir%\%project_name%\%service_name%\build.gradle"

REM Agregar dependencias específicas según el tipo de servicio
echo %service_name% | findstr /i "sensor mapper" > nul
if not errorlevel 1 (
    echo // Dependencias para MQTT>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo dependencies {>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo     implementation 'org.springframework.integration:spring-integration-mqtt'>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo }>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo.>> "%project_dir%\%project_name%\%service_name%\build.gradle"
)

echo %service_name% | findstr /i "semantic" > nul
if not errorlevel 1 (
    echo // Depenedencias adicionales para Jena ^(RDF^)>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo ext{>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo     JENA_VERSION="5.1.0">> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo }>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo.>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo // Dependencias adicionales para SWoT>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo dependencies {>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo     implementation "org.apache.jena:jena-core:$JENA_VERSION">> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo     implementation "org.apache.jena:jena-arq:$JENA_VERSION">> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo     implementation "org.apache.jena:jena-rdfconnection:$JENA_VERSION">> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo     implementation 'org.eclipse.rdf4j:rdf4j-runtime:4.2.2'>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo }>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo.>> "%project_dir%\%project_name%\%service_name%\build.gradle"
)

echo %service_name% | findstr /i "gateway" > nul
if not errorlevel 1 (
    echo // Dependencias para Spring Cloud Gateway>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo ext{>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo     set^('springCloudVersion', "2023.0.3"^)>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo }>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo dependencies {>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo     implementation 'org.springframework.cloud:spring-cloud-starter-gateway-mvc'>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo }>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo dependencyManagement {>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo     imports {>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo         mavenBom "org.springframework.cloud:spring-cloud-dependencies:${springCloudVersion}">> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo     }>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo }>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo.>> "%project_dir%\%project_name%\%service_name%\build.gradle"
)

echo %service_name% | findstr /i "visualization" > nul
if not errorlevel 1 (
    echo // Dependencias para Thymeleaf para la visualización>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo dependencies {>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo     implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo }>> "%project_dir%\%project_name%\%service_name%\build.gradle"
    echo.>> "%project_dir%\%project_name%\%service_name%\build.gradle"
)

echo Proyecto Spring Boot para %service_name% generado exitosamente con código de ejemplo y dependencias adicionales.
exit /b

REM Función para crear la estructura del proyecto
:create_project_structure
set "project_name=%~1"
set "project_dir=%PROJECTS_DIR%"

echo Creando proyecto %project_name%...

REM Crear directorio del proyecto principal
if not exist "%project_dir%\%project_name%" mkdir "%project_dir%\%project_name%"

REM Generar proyectos Spring Boot para servicios relevantes
for %%s in (apigateway visualization semanticmapper semanticreasoner sensorsimulator) do (
    call :generate_spring_boot_project "%project_name%" "%%s" "%project_dir%"
)

REM Copiar estructura base del proyecto
xcopy /E /I /Y "%RESOURCES_DIR%\project_base\*" "%project_dir%\%project_name%\"

REM Reemplazar placeholders en archivos
powershell -Command "(Get-Content '%project_dir%\%project_name%\docker-compose.yml') -replace '{{PROJECT_NAME}}', '%project_name%' | Set-Content -Encoding ASCII '%project_dir%\%project_name%\docker-compose.yml'"

REM Copiar Dockerfiles para cada servicio
for %%s in (sensorsimulator semanticmapper semanticreasoner apigateway visualization mosquitto) do (
    copy "%RESOURCES_DIR%\Dockerfiles\Dockerfile.%%s" "%project_dir%\%project_name%\%%s\Dockerfile"
)

echo Proyecto %project_name% creado exitosamente en %project_dir%\%project_name%.
exit /b

REM Función para ejecutar docker-compose en un proyecto
:run_project
set "project_name=%~1"
set "project_dir=%PROJECTS_DIR%\%project_name%"

REM Verificar si el archivo docker-compose.yml existe
if not exist "%project_dir%\docker-compose.yml" (
    echo No se encontró docker-compose.yml en %project_dir%.
    exit /b 1
)

REM Ejecutar docker-compose
cd /d "%project_dir%"
docker-compose up -d

if errorlevel 1 (
    echo Ocurrió un error al ejecutar Docker Compose en %project_name%.
    exit /b 1
) else (
    echo Docker Compose ejecutado exitosamente en %project_name%.
)
exit /b

REM Punto de entrada principal del script
:main
if "%1"=="init" (
    if "%2"=="" (
        call :show_usage
        exit /b 1
    )
    set "project_name=%2"
    call :create_project_structure "%2"
) else if "%1"=="run" (
    if "%2"=="" (
        call :show_usage
        exit /b 1
    )
    call :run_project "%2"
) else (
    call :show_usage
    exit /b 1
)
exit /b