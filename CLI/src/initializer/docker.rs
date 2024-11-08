use crate::config::ProjectConfig;
use crate::utils;
use std::path::Path;
use tokio::fs;

pub(crate) async fn generate_docker_compose(project_dir: &Path, config: &ProjectConfig) -> anyhow::Result<()> {
    // Implementación para generar docker-compose.yml ;
    let mut content = String::new();


    // Definiendo servicios
    content.push_str("\nservices:\n");
    if config.services.jena {
        content.push_str("  jena:\n");
        content.push_str("    image: stain/jena-fuseki\n");
        content.push_str("    ports:\n");
        content.push_str("      - \"3030:3030\"\n");
        content.push_str("    volumes:\n");
        content.push_str("      - ./jena/data:/fuseki\n");
        content.push_str("    environment:\n");

        content.push_str("      - ADMIN_PASSWORD=");
        content.push_str(&config.jena_admin_password);
        content.push_str("\n");
        content.push_str("    networks:\n");
        content.push_str("      - jena-network\n");
    }

    if config.services.mosquitto {
        content.push_str("  mosquitto:\n");
        content.push_str("    build:\n");
        content.push_str("      context: ./mosquitto\n");
        content.push_str("      dockerfile: Dockerfile\n");
        content.push_str("    ports:\n");
        content.push_str("      - \"1883:1883\"\n");
        content.push_str("      - \"9001:9001\"\n");
        content.push_str("    volumes:\n");
        content.push_str("      - ./mosquitto/config:/mosquitto/config\n");
        content.push_str("      - ./mosquitto/data:/mosquitto/data\n");
        content.push_str("      - ./mosquitto/log:/mosquitto/log\n");
        content.push_str("    networks:\n");
        content.push_str("      - mosquitto-network\n");
        content.push_str("    restart: unless-stopped\n");
    }

    if config.services.sensors {
        content.push_str("  sensors:\n");
        content.push_str("    build: ./sensors\n");
        if config.services.mosquitto {
            content.push_str("    depends_on:\n");
            content.push_str("      - mosquitto\n");
            content.push_str("    networks:\n");
            content.push_str("      - mosquitto-network\n");
        }
        content.push_str("    environment:\n");
        content.push_str("      - MQTT_BROKER=tcp://mosquitto:1883\n");
        content.push_str("      - MQTT_TOPIC=sensors_swot\n");
    }

    if config.services.mapper {
        content.push_str("  mapper:\n");
        content.push_str("    build: ./mapper\n");
        content.push_str("    depends_on:\n");
        if config.services.jena {
            content.push_str("      - jena\n");
        }
        if config.services.sensors {
            content.push_str("      - sensors\n");
        }
        if config.services.mosquitto {
            content.push_str("      - mosquitto\n");
        }
        content.push_str("    environment:\n");
        content.push_str("      - MQTT_BROKER=tcp://mosquitto:1883\n");
        content.push_str("      - MQTT_TOPIC=sensors_swot\n");
        content.push_str("      - SWOT_URL_PREFIX=http://swot.local/\n");

        // Crear un ID random para el cliente MQTT
        let client_id = "CLIENT_".to_string() + &utils::security::generate_random_string(5);
        content.push_str("      - MQTT_CLIENT=");
        content.push_str(&client_id);
        content.push_str("\n");

        content.push_str("      - TRIPLESTORE_URL=http://jena:3030\n");
        content.push_str("      - TRIPLESTORE_DATASET=swot\n");
        content.push_str("      - TRIPLESTORE_USERNAME=admin\n");
        content.push_str("      - TRIPLESTORE_PASSWORD=");
        if config.services.jena {
            content.push_str(&config.jena_admin_password);
        }
        content.push_str("\n");

        content.push_str("    networks:\n");
        if config.services.jena {
            content.push_str("      - jena-network\n");
        }
        if config.services.mosquitto {
            content.push_str("      - mosquitto-network\n");
        }
    }

    if config.services.reasoner {
        content.push_str("  reasoner:\n");
        content.push_str("    build: ./reasoner\n");
        content.push_str("    depends_on:\n");
        if config.services.jena {
            content.push_str("      - jena\n");
        }
        if config.services.mapper {
            content.push_str("      - mapper\n");
        }
        content.push_str("    environment:\n");
        content.push_str("      - SWOT_URL_PREFIX=http://swot.local/\n");
        content.push_str("      - TRIPLESTORE_URL=http://jena:3030\n");
        content.push_str("      - TRIPLESTORE_DATASET=swot\n");
        content.push_str("      - TRIPLESTORE_USERNAME=admin\n");
        content.push_str("      - TRIPLESTORE_PASSWORD=");
        if config.services.jena {
            content.push_str(&config.jena_admin_password);
        }
        content.push_str("\n");

        content.push_str("    networks:\n");
        content.push_str("      - reasoner-network\n");
        if config.services.jena {
            content.push_str("      - jena-network\n");
        }
    }

    if config.services.api {
        content.push_str("  api:\n");
        content.push_str("    build: ./api\n");
        content.push_str("    ports:\n");
        content.push_str("      - \"8081:8081\"\n");
        content.push_str("    depends_on:\n");
        if config.services.jena {
            content.push_str("      - jena\n");
        }
        content.push_str("    environment:\n");
        content.push_str("      - SWOT_URL_PREFIX=http://swot.local/\n");
        content.push_str("      - TRIPLESTORE_URL=http://jena:3030\n");
        content.push_str("      - TRIPLESTORE_DATASET=swot\n");
        content.push_str("      - TRIPLESTORE_USERNAME=admin\n");
        content.push_str("      - TRIPLESTORE_PASSWORD=");
        if config.services.jena {
            content.push_str(&config.jena_admin_password);
        }
        content.push_str("\n");

        content.push_str("    networks:\n");
        content.push_str("      - gateway-network\n");
        if config.services.jena {
            content.push_str("      - jena-network\n");
        }
    }


    if config.services.gateway {
        content.push_str("  gateway:\n");
        content.push_str("    build: ./gateway\n");
        content.push_str("    ports:\n");
        content.push_str("      - \"8080:8080\"\n");
        content.push_str("    depends_on:\n");
        if config.services.api {
            content.push_str("      - api\n");
        }
        content.push_str("    environment:\n");
        content.push_str("      - API_URL=http://api:8081\n");
        if config.services.dashboard {
            content.push_str("      - DASHBOARD_URL=http://dashboard:8090\n");
        }
        content.push_str("    networks:\n");
        content.push_str("      - gateway-network\n");
        if config.services.jena {
            content.push_str("      - jena-network\n");
        }
    }

    if config.services.dashboard {
        content.push_str("  dashboard:\n");
        content.push_str("    build: ./dashboard\n");
        content.push_str("    ports:\n");
        content.push_str("      - \"8090:8090\"\n");
        content.push_str("    environment:\n");
        content.push_str("      - API_URL=http://api:8081\n");
        if config.services.gateway {
            content.push_str("    depends_on:\n");
            content.push_str("      - api\n");
            content.push_str("    networks:\n");
            content.push_str("      - gateway-network\n");
        }
    }

    // Definiendo redes
    content.push_str("networks:\n");
    if config.services.jena {
        content.push_str("  jena-network:\n");
        content.push_str("    driver: bridge\n");
    }
    if config.services.mosquitto {
        content.push_str("  mosquitto-network:\n");
        content.push_str("    driver: bridge\n");
    }

    if config.services.gateway {
        content.push_str("  gateway-network:\n");
        content.push_str("    driver: bridge\n");
    }
    if config.services.reasoner {
        content.push_str("  reasoner-network:\n");
        content.push_str("    driver: bridge\n");
    }


    // Escribir contenido en el archivo
    fs::write(project_dir.join("docker-compose.yml"), content).await?;


    Ok(())
}

