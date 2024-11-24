use crate::config::ProjectConfig;
use crate::initializer::demo_one_dockergen;
use crate::utils;

pub(crate) async fn setup_project(config: &mut ProjectConfig) -> anyhow::Result<()> {
    let project_dir = utils::files::get_projects_dir().join(&config.name);
    let resources_dir = utils::files::get_resources_dir();
    if config.language.name != "python" {
        return Err(anyhow::anyhow!("Unsupported language: {}", config.language.name));
    }

    config.services.gateway = false;

    // Mapeo de servicios a sus directorios correspondientes
    let services = vec![
        ("sensors", config.services.sensors),
        ("mapper", config.services.mapper),
        ("reasoner", config.services.reasoner),
        ("api", config.services.api),
        ("dashboard", config.services.dashboard),
    ];

    // Itera sobre los servicios habilitados y copia sus directorios
    for (service_name, is_enabled) in services {
        if is_enabled {
            println!("Copying {} resources...", service_name);
            let service_dir = resources_dir.join("python").join(service_name);
            println!("Copying from: {}", service_dir.display());
            println!("Copying to: {}", project_dir.display());
            utils::files::copy_dir_recursive(&service_dir, &project_dir.join(service_name), None).await?;
        }
    }

    // Generado archivo docker-compose.yml
    demo_one_dockergen::generate_docker_compose(&project_dir, &config).await;


    Ok(())
}