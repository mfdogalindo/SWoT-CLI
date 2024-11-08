use crate::config::ProjectConfig;
use crate::initializer::docker;
use crate::initializer::java;
use crate::initializer::python;
use crate::initializer::typescript;
use crate::utils;
use anyhow::Result;
use std::path::Path;
use tokio::fs;

pub async fn create_project(
    project_name: &str,
    demo: bool,
    with_jena: bool,
    with_mosquitto: bool,
    with_sensor_simulator: bool,
    lang: &str,
    lang_version: &str,
    tool_version: &str,
) -> Result<()> {
    let project_dir = utils::files::get_projects_dir().join(project_name);
    fs::create_dir_all(&project_dir).await?;

    let jena_password = utils::security::generate_random_string(16);

    // Create project configuration
    let mut config = ProjectConfig::new(
        project_name,
        &jena_password,
        demo,
        with_jena,
        with_mosquitto,
        with_sensor_simulator,
        lang,
        lang_version,
        tool_version,
    );

    // Save project configuration
    config.save(&project_dir)?;

    match lang {
        "java" => java::setup_project(&config).await?,
        "python" => python::setup_project(&project_dir, project_name).await?,
        "typescript" => typescript::setup_project(&project_dir, project_name).await?,
        _ => return Err(anyhow::anyhow!("Unsupported language: {}", lang)),
    }

    // Copy common resources if needed
    if with_jena {
        println!("Copying Apache Jena resources...");
        copy_jena_resources(&project_dir).await?;
    }

    // Copy Mosquitto resources
    if with_mosquitto {
        println!("Copying Mosquitto resources...");
        copy_mosquitto_resources(&project_dir).await?;
    }

    // Generate docker-compose.yml
    docker::generate_docker_compose(&project_dir, &config).await?;

    println!("Project created successfully at: {}", project_dir.display());

    Ok(())
}

async fn copy_jena_resources(project_dir: &Path) -> Result<()> {
    let jena_dir = utils::files::get_resources_dir().join("Common/jena");
    utils::files::copy_dir_recursive(&jena_dir, &project_dir.join("jena"), Option::None).await
}

async fn copy_mosquitto_resources(project_dir: &Path) -> Result<()> {
    let mosquitto_dir = utils::files::get_resources_dir().join("Common/mosquitto");
    utils::files::copy_dir_recursive(&mosquitto_dir, &project_dir.join("mosquitto"), Option::None).await
}


