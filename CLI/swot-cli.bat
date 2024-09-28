@echo off
setlocal enabledelayedexpansion

REM Directorios base
set "SCRIPT_DIR=%~dp0"
set "RESOURCES_DIR=%SCRIPT_DIR%Resources"
set "PROJECTS_DIR=%SCRIPT_DIR%Projects"

REM Llamar al punto de entrada principal
call :main %*

REM Función para mostrar el uso del script
:show_usage
echo Uso: swot-cli.bat init ^<project-name^> --ontology=^<ontologies^>
echo Ejemplo: swot-cli.bat init my-swot-project --ontology=iot-lite,ssn,sosa
exit /b

REM Función para generar un proyecto Spring Boot
:generate_spring_boot_project
set "service_name=%~1"
set "project_dir=%~2"
set "package_name=com.swot.%service_name%"

echo Generando proyecto Spring Boot para %service_name%...

REM Crear un archivo temporal para la salida
set "temp_file=%TEMP%\springboot_%RANDOM%.zip"

REM Hacer la solicitud a Spring Initializr
powershell -Command "(New-Object System.Net.WebClient).DownloadFile('https://start.spring.io/starter.zip?type=gradle-project&language=java&bootVersion=3.3.4&baseDir=%service_name%&groupId=com.swot&artifactId=%service_name%&name=%service_name%&description=SWoT %service_name% service&packageName=%package_name%&packaging=jar&javaVersion=22&dependencies=web,actuator,devtools', '%temp_file%')"

REM Descomprimir el archivo en el directorio del proyecto
powershell -Command "Expand-Archive -Path '%temp_file%' -DestinationPath '%project_dir%' -Force"

REM Limpiar
del "%temp_file%"

REM Capitalizar la primera letra de service_name usando PowerShell
for /f %%i in ('powershell -Command "([char]::ToUpper('%service_name%'[0]) + '%service_name:~1%')"') do set "service_name_capitalized=%%i"


REM Insertar código de ejemplo
set "main_class_path=%project_dir%\%service_name%\src\main\java\com\swot\%service_name%\example"
echo Copiando recursos de ejemplo  de %RESOURCES_DIR%\Templates\%service_name_capitalized%.java en %main_class_path%

REM Verificar si el directorio existe, si no, crearlo
if not exist "%main_class_path%" (
    mkdir "%main_class_path%"
) else (
    echo El directorio ya existe.
)

:: Copiar el archivo usando el nuevo service_name con la primera letra en mayúscula
copy "%RESOURCES_DIR%\Templates\%service_name_capitalized%.java" "%main_class_path%"


REM Actualizar el paquete en el archivo Java
powershell -Command "(Get-Content '%main_class_path%\%service_name%.java') -replace 'package com\.example\..*?;', 'package %package_name%.example;' | Set-Content '%main_class_path%\%service_name%.java'"


REM Actualizar build.gradle con dependencias adicionales
echo. >> "%project_dir%\%service_name%\build.gradle"
echo // Dependencias adicionales para SWoT >> "%project_dir%\%service_name%\build.gradle"
echo dependencies { >> "%project_dir%\%service_name%\build.gradle"
echo     implementation 'org.apache.jena:jena-core:4.6.1' >> "%project_dir%\%service_name%\build.gradle"
echo     implementation 'org.apache.jena:jena-arq:4.6.1' >> "%project_dir%\%service_name%\build.gradle"
echo     implementation 'org.eclipse.rdf4j:rdf4j-runtime:4.2.2' >> "%project_dir%\%service_name%\build.gradle"
echo } >> "%project_dir%\%service_name%\build.gradle"

echo Proyecto Spring Boot para %service_name% generado exitosamente con código de ejemplo y dependencias adicionales.
exit /b

REM Función para crear la estructura del proyecto
:create_project_structure
set "project_name=%~1"
set "ontologies=%~2"
set "project_dir=%PROJECTS_DIR%\%project_name%"

echo Creando proyecto %project_name% con ontologías: %ontologies%

REM Crear directorio del proyecto
mkdir "%project_dir%"

REM Copiar estructura base del proyecto
xcopy /E /I /Y "%RESOURCES_DIR%\project_base" "%project_dir%"

REM Generar proyectos Spring Boot para servicios relevantes
for %%s in (apiGateway visualization semanticMapper semanticReasoner) do (
    call :generate_spring_boot_project %%s "%project_dir%"
)

REM Copiar Dockerfiles para cada servicio
for %%s in (sensorSimulator semanticMapper semanticReasoner apiGateway visualization mosquitto) do (
    copy "%RESOURCES_DIR%\Dockerfiles\Dockerfile.%%s" "%project_dir%\%%s\Dockerfile"
)

REM Crear archivo de configuración con las ontologías seleccionadas
echo %ontologies% > "%project_dir%\ontologies.txt"

REM Reemplazar placeholders en archivos si es necesario
powershell -Command "(gc '%project_dir%\docker-compose.yml') -replace '{{PROJECT_NAME}}', '%project_name%' | Out-File -encoding ASCII '%project_dir%\docker-compose.yml'"

echo Proyecto %project_name% creado exitosamente en %project_dir%.
exit /b

REM Punto de entrada principal del script
:main
if "%1" neq "init" goto show_usage
if "%2" equ "" goto show_usage

REM Extraer nombre del proyecto y ontologías
set "project_name=%2"
set "ontologies=%3"
set "ontologies=%ontologies:--ontology=%"

REM Crear la estructura del proyecto 
call :create_project_structure "%project_name%" "%ontologies%"
exit /b

:: Función para convertir una letra a mayúscula
:toUpperCase
setlocal enabledelayedexpansion

endlocal & set "%~1=%first_letter%"
exit /b