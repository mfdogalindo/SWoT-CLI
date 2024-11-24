use crate::config::ProjectConfig;
use std::collections::HashMap;

struct BuildConfig {
    context: String,
    dockerfile: Option<String>,
}

// Estructura para manejar la configuración de servicios individuales
#[derive(Default)]
pub struct ServiceConfig {
    name: String,
    image: Option<String>,
    build: Option<BuildConfig>,
    ports: Vec<String>,
    volumes: Vec<String>,
    environment: Vec<(String, String)>,
    networks: Vec<String>,
    depends_on: Vec<String>,
    restart: Option<String>,
}


// Implementación para ServiceConfig
impl ServiceConfig {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            ..Default::default()
        }
    }

    pub fn build(self) -> Self {
        self
    }

    // Cambiar los métodos para usar &mut self en lugar de self
    pub fn with_image(&mut self, image: &str) -> &mut Self {
        self.image = Some(image.to_string());
        self
    }

    pub fn with_build(&mut self, context: &str, dockerfile: Option<&str>) -> &mut Self {
        self.build = Some(BuildConfig {
            context: context.to_string(),
            dockerfile: dockerfile.map(String::from),
        });
        self
    }

    pub fn add_port(&mut self, port: &str) -> &mut Self {
        self.ports.push(port.to_string());
        self
    }

    pub fn add_volume(&mut self, volume: &str) -> &mut Self {
        self.volumes.push(volume.to_string());
        self
    }

    pub fn add_env(&mut self, key: &str, value: &str) -> &mut Self {
        self.environment.push((key.to_string(), value.to_string()));
        self
    }

    pub fn add_network(&mut self, network: &str) -> &mut Self {
        self.networks.push(network.to_string());
        self
    }

    pub fn add_dependency(&mut self, service: &str) -> &mut Self {
        self.depends_on.push(service.to_string());
        self
    }

    pub fn with_restart(&mut self, policy: &str) -> &mut Self {
        self.restart = Some(policy.to_string());
        self
    }

    fn to_yaml(&self) -> String {
        let mut content = format!("  {}:\n", self.name);

        if let Some(ref image) = self.image {
            content.push_str(&format!("    image: {}\n", image));
        }

        if let Some(ref build) = self.build {
            content.push_str("    build:\n");
            content.push_str(&format!("      context: {}\n", build.context));
            if let Some(ref dockerfile) = build.dockerfile {
                content.push_str(&format!("      dockerfile: {}\n", dockerfile));
            }
        }

        if !self.ports.is_empty() {
            content.push_str("    ports:\n");
            for port in &self.ports {
                content.push_str(&format!("      - \"{}\"\n", port));
            }
        }

        if !self.volumes.is_empty() {
            content.push_str("    volumes:\n");
            for volume in &self.volumes {
                content.push_str(&format!("      - {}\n", volume));
            }
        }

        if !self.environment.is_empty() {
            content.push_str("    environment:\n");
            for (key, value) in &self.environment {
                content.push_str(&format!("      - {}={}\n", key, value));
            }
        }

        if !self.networks.is_empty() {
            content.push_str("    networks:\n");
            for network in &self.networks {
                content.push_str(&format!("      - {}\n", network));
            }
        }

        if !self.depends_on.is_empty() {
            content.push_str("    depends_on:\n");
            for dependency in &self.depends_on {
                content.push_str(&format!("      - {}\n", dependency));
            }
        }

        if let Some(ref restart) = self.restart {
            content.push_str(&format!("    restart: {}\n", restart));
        }

        content
    }
}

// Registro de servicios
pub struct ServiceRegistry {
    services: HashMap<String, ServiceConfig>,
    networks: Vec<String>,
}

impl ServiceRegistry {
    pub fn new() -> Self {
        Self {
            services: HashMap::new(),
            networks: Vec::new(),
        }
    }

    pub fn register(&mut self, name: String, service: ServiceConfig) {
        self.services.insert(name, service);
    }

    pub fn add_network(&mut self, network: String) {
        if !self.networks.contains(&network) {
            self.networks.push(network);
        }
    }
}

// Estructura principal para la generación del docker-compose
pub struct DockerComposeGenerator<'a> {
    config: &'a ProjectConfig,
    registry: ServiceRegistry,
}

impl<'a> DockerComposeGenerator<'a> {
    pub fn new(config: &'a ProjectConfig) -> Self {
        Self {
            config,
            registry: ServiceRegistry::new(),
        }
    }

    pub fn add_service(&mut self, name: &str, service: ServiceConfig) {
        // Registrar el servicio
        self.registry.register(name.to_string(), service);
    }

    pub fn add_network(&mut self, network: &str) {
        self.registry.add_network(network.to_string());
    }

    pub fn generate(&self) -> String {
        let mut content = String::from("services:\n");

        // Generar servicios
        for (_, service) in &self.registry.services {
            content.push_str(&service.to_yaml());
        }

        // Agregar redes
        content.push_str("\nnetworks:\n");
        for network in &self.registry.networks {
            content.push_str(&format!("  {}:\n", network));
            content.push_str("    driver: bridge\n");
        }

        content
    }
}
