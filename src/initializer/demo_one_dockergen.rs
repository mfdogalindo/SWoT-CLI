use crate::config::ProjectConfig;
use crate::initializer::docker;
use crate::initializer::docker::DockerComposeGenerator;
use std::path::Path;
use tokio::fs;

pub(crate) async fn generate_docker_compose(project_dir: &Path, config: &ProjectConfig) {
    let mut generator = DockerComposeGenerator::new(config);

    // Agregar servicios por defecto
    if config.services.jena {
        let mut jena_service = docker::ServiceConfig::new("jena");
        jena_service.with_image("stain/jena-fuseki")
            .add_port("3030:3030")
            .add_volume("./jena/data:/fuseki")
            .add_env("ADMIN_PASSWORD", &config.jena_admin_password)
            .add_network("jena-network");

        generator.add_service("jena", jena_service.build());
        generator.add_network("jena-network");
    }

    if config.services.mosquitto {
        let mut mosquitto_service = docker::ServiceConfig::new("mosquitto");
        mosquitto_service.with_build("./mosquitto", Some("Dockerfile"))
            .add_port("1883:1883")
            .add_port("9001:9001")
            .add_volume("./mosquitto/config:/mosquitto/config")
            .add_volume("./mosquitto/data:/mosquitto/data")
            .add_volume("./mosquitto/log:/mosquitto/log")
            .add_network("mosquitto-network")
            .with_restart("unless-stopped");

        generator.add_service("mosquitto", mosquitto_service.build());
        generator.add_network("mosquitto-network");
    }

    if config.services.sensors {
        let mut sensors_service = docker::ServiceConfig::new("sensors");
        sensors_service.with_build("./sensors", Some("Dockerfile"))
            .add_env("MQTT_BROKER", "tcp://mosquitto:1883")
            .add_env("MQTT_TOPIC", "sensors_swot")
            .add_network("mosquitto-network")
            .add_dependency("mosquitto");

        generator.add_service("sensors", sensors_service.build());
    }

    if config.services.mapper {
        let mut mapper_service = docker::ServiceConfig::new("mapper");
        mapper_service.with_build("./mapper", Some("Dockerfile"));

        if config.services.jena {
            mapper_service.add_env("TRIPLESTORE_URL", "http://jena:3030")
                .add_env("TRIPLESTORE_DATASET", "swot")
                .add_env("TRIPLESTORE_USERNAME", "admin")
                .add_env("TRIPLESTORE_PASSWORD", &config.jena_admin_password)
                .add_dependency("jena")
                .add_network("jena-network");
        }

        if config.services.mosquitto {
            mapper_service.add_env("MQTT_BROKER", "tcp://mosquitto:1883")
                .add_env("MQTT_TOPIC", "sensors_swot")
                .add_env("MQTT_CLIENT", "CLIENT_82DZQ")
                .add_dependency("mosquitto")
                .add_network("mosquitto-network");
        }

        if config.services.sensors {
            mapper_service.add_dependency("sensors");
        }

        mapper_service.add_env("SWOT_URL_PREFIX", "http://swot.local/");

        generator.add_service("mapper", mapper_service.build());
    }

    if config.services.reasoner {
        let mut reasoner_service = docker::ServiceConfig::new("reasoner");
        reasoner_service.with_build("./reasoner", Some("Dockerfile"));

        if config.services.jena {
            reasoner_service.add_env("TRIPLESTORE_URL", "http://jena:3030")
                .add_env("TRIPLESTORE_DATASET", "swot")
                .add_env("TRIPLESTORE_USERNAME", "admin")
                .add_env("TRIPLESTORE_PASSWORD", &config.jena_admin_password)
                .add_dependency("jena")
                .add_network("jena-network");
        }

        if config.services.mapper {
            reasoner_service.add_dependency("mapper");
        }

        reasoner_service.add_env("SWOT_URL_PREFIX", "http://swot.local/");

        generator.add_network("reasoner-network");
        generator.add_service("reasoner", reasoner_service.build());
    }

    if config.services.api {
        let mut api_service = docker::ServiceConfig::new("api");
        api_service.with_build("./api", Some("Dockerfile"))
            .add_port("8081:8081");

        if config.services.jena {
            api_service.add_env("TRIPLESTORE_URL", "http://jena:3030")
                .add_env("TRIPLESTORE_DATASET", "swot")
                .add_env("TRIPLESTORE_USERNAME", "admin")
                .add_env("TRIPLESTORE_PASSWORD", &config.jena_admin_password)
                .add_dependency("jena")
                .add_network("jena-network");
        }

        if config.services.mapper {
            api_service.add_dependency("mapper");
        }

        api_service.add_env("SWOT_URL_PREFIX", "http://swot.local/");
        api_service.add_network("api-network");
        generator.add_network("api-network");
        generator.add_service("api", api_service.build());
    }

    if config.services.gateway {
        let mut gateway_service = docker::ServiceConfig::new("gateway");
        gateway_service.with_build("./gateway", Some("Dockerfile"))
            .add_port("8080:8080");

        if config.services.api {
            //API_URL=http://api:8081
            gateway_service.add_env("API_URL", "http://api:8081")
                .add_dependency("api");
        }

        if config.services.dashboard {
            gateway_service.add_dependency("dashboard")
                .add_env("DASHBOARD_URL", "http://dashboard:8090");
        }

        generator.add_service("gateway", gateway_service.build());
    }

    if config.services.dashboard {
        let mut dashboard_service = docker::ServiceConfig::new("dashboard");
        dashboard_service.with_build("./dashboard", Some("Dockerfile"))
            .add_port("8090:8090");

        if config.services.api {
            dashboard_service.add_env("API_URL", "http://api:8081")
                .add_dependency("api");
        }

        dashboard_service.add_network("api-network");
        generator.add_service("dashboard", dashboard_service.build());
    }

    // Generar y escribir el contenido
    let content = generator.generate();
    fs::write(project_dir.join("docker-compose.yml"), content).await.expect("TODO: panic message");
}