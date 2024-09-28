Estos scripts y templates:

1. Generan proyectos Spring Boot 3.2.3 con Gradle y Java 21.
2. Insertan código de ejemplo específico para cada servicio.
3. Añaden dependencias adicionales al archivo `build.gradle` para Apache Jena y RDF4J, que son útiles para el procesamiento de datos semánticos.

Para usar estos scripts actualizados:

1. Asegúrate de tener la estructura de directorios correcta, incluyendo la carpeta `Resources/Templates` con los archivos de template.
2. Ejecuta el script como antes:

   En Unix/Linux:
   ```
   ./swot-cli.sh init my-swot-project --ontology=iot-lite,ssn,sosa
   ```

   En Windows:
   ```
   swot-cli.bat init my-swot-project --ontology=iot-lite,ssn,sosa
   ```

Estos scripts generarán proyectos Spring Boot con código de ejemplo y dependencias relevantes para el desarrollo de aplicaciones SWoT.
