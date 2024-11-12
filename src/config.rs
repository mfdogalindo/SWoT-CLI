use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectConfig {
    pub name: String,
    pub language: Language,
    pub services: Services,
    pub demo: bool,
    pub jena_admin_password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Services {
    pub jena: bool,
    pub mosquitto: bool,
    pub sensors: bool,
    pub mapper: bool,
    pub reasoner: bool,
    pub api: bool,
    pub gateway: bool,
    pub dashboard: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Language {
    pub name: String,
    pub version: String,
    pub tool: String,
}


impl ProjectConfig {
    pub fn new(
        name: &str,
        jena_admin_password: &str,
        demo: bool,
        with_jena: bool,
        with_mosquitto: bool,
        with_sensor_simulator: bool,
        language: &str,
        lang_version: &str,
        tool_version: &str,
    ) -> Self {
        let language = language.to_lowercase();


        if language != "java" && language != "python" && language != "typescript" {
            panic!("Unsupported language: {}", language);
        }

        let mut lang_data = Language {
            name: language.to_string(),
            version: "".to_string(),
            tool: "".to_string(),
        };

        if language == "java" {
            if lang_version.is_empty() {
                lang_data.version = "23".to_string();
            } else {
                lang_data.version = lang_version.to_string();
            }

            if tool_version.is_empty() {
                lang_data.tool = "3.3.5".to_string();
            } else {
                lang_data.tool = tool_version.to_string();
            }
        }

        ProjectConfig {
            name: name.to_string(),
            jena_admin_password: jena_admin_password.to_string(),
            demo,
            language: lang_data,
            services: Services {
                jena: with_jena,
                mosquitto: with_mosquitto,
                sensors: with_sensor_simulator,
                mapper: true,
                reasoner: true,
                api: true,
                gateway: true,
                dashboard: true,
            },
        }
    }

    pub fn save(&mut self, path: &Path) -> Result<()> {
        let previous = Self::load(path);

        if let Ok(previous) = previous {
            self.jena_admin_password = previous.jena_admin_password;
        }

        let yaml = serde_yaml::to_string(self)?;
        std::fs::write(path.join("swot.yaml"), yaml)?;
        Ok(())
    }

    pub fn load(path: &Path) -> Result<Self> {
        let yaml = std::fs::read_to_string(path.join("swot.yaml"))?;
        let config = serde_yaml::from_str(&yaml)?;
        Ok(config)
    }
}