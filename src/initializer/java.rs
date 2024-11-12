use crate::config::ProjectConfig;
use crate::utils;
use std::future::Future;
use std::path::Path;
use std::pin::Pin;
use tokio::fs;

pub(crate) async fn setup_project(config: &ProjectConfig) -> anyhow::Result<()> {
    let project_dir = utils::files::get_projects_dir().join(&config.name);

    if config.language.name != "java" {
        return Err(anyhow::anyhow!("Unsupported language: {}", config.language.name));
    }

    if config.services.sensors {
        let mut dependencies = String::new();
        dependencies.push_str("dependencies {\n");
        // MQTT Support
        dependencies.push_str("\timplementation 'org.springframework.integration:spring-integration-mqtt'\n");
        // JSON Support
        dependencies.push_str("\timplementation 'org.springframework.boot:spring-boot-starter-json'\n");
        dependencies.push_str("}\n");
        generate_springboot_project(&project_dir, &config, "sensors", "", &dependencies).await;
        copy_dockerfiles(&project_dir, "sensors").await;
        copy_demo_resources(&project_dir, &config, "sensors").await;
    }

    if config.services.mapper {
        let mut dependencies = String::new();

        dependencies.push_str("ext{\n\tJENA_VERSION=\"5.1.0\"\n}\n");

        dependencies.push_str("dependencies {\n");

        // MQTT Support
        dependencies.push_str("\timplementation 'org.springframework.integration:spring-integration-mqtt'\n");
        // Apache Jena support
        dependencies.push_str("\timplementation \"org.apache.jena:jena-core:$JENA_VERSION\"\n");
        dependencies.push_str("\timplementation \"org.apache.jena:jena-arq:$JENA_VERSION\"\n");
        dependencies.push_str("\timplementation \"org.apache.jena:jena-rdfconnection:$JENA_VERSION\"\n");
        dependencies.push_str("\timplementation 'org.eclipse.rdf4j:rdf4j-runtime:4.2.2'\n");

        dependencies.push_str("}\n");

        generate_springboot_project(&project_dir, &config, "mapper", "", &dependencies).await;
        copy_dockerfiles(&project_dir, "mapper").await;
        copy_demo_resources(&project_dir, &config, "mapper").await;
    }

    if config.services.reasoner {
        let mut dependencies = String::new();

        dependencies.push_str("ext{\n\tJENA_VERSION=\"5.1.0\"\n}\n");

        dependencies.push_str("dependencies {\n");

        // Apache Jena support
        dependencies.push_str("\timplementation \"org.apache.jena:jena-core:$JENA_VERSION\"\n");
        dependencies.push_str("\timplementation \"org.apache.jena:jena-arq:$JENA_VERSION\"\n");
        dependencies.push_str("\timplementation \"org.apache.jena:jena-rdfconnection:$JENA_VERSION\"\n");
        dependencies.push_str("\timplementation 'org.eclipse.rdf4j:rdf4j-runtime:4.2.2'\n");

        dependencies.push_str("}\n");

        generate_springboot_project(&project_dir, &config, "reasoner", "web", &dependencies).await;
        copy_dockerfiles(&project_dir, "reasoner").await;
        copy_demo_resources(&project_dir, &config, "reasoner").await;
    }

    if config.services.api {
        let mut dependencies = String::new();

        dependencies.push_str("ext{\n\tJENA_VERSION=\"5.1.0\"\n}\n");

        dependencies.push_str("dependencies {\n");

        // Apache Jena support
        dependencies.push_str("\timplementation \"org.apache.jena:jena-core:$JENA_VERSION\"\n");
        dependencies.push_str("\timplementation \"org.apache.jena:jena-arq:$JENA_VERSION\"\n");
        dependencies.push_str("\timplementation \"org.apache.jena:jena-rdfconnection:$JENA_VERSION\"\n");
        dependencies.push_str("\timplementation 'org.eclipse.rdf4j:rdf4j-runtime:4.2.2'\n");

        // Swagger UI
        dependencies.push_str("\timplementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0'\n");

        dependencies.push_str("}\n");

        generate_springboot_project(&project_dir, &config, "api", "web", &dependencies).await;
        copy_dockerfiles(&project_dir, "api").await;
        copy_demo_resources(&project_dir, &config, "api").await;
    }

    if config.services.gateway {
        generate_springboot_project(&project_dir, &config, "gateway", "cloud-gateway,web", "").await;
        copy_dockerfiles(&project_dir, "gateway").await;
        copy_demo_resources(&project_dir, &config, "gateway").await;
    }

    if config.services.dashboard {
        generate_springboot_project(&project_dir, &config, "dashboard", "thymeleaf,web", "").await;
        copy_dockerfiles(&project_dir, "dashboard").await;
        copy_demo_resources(&project_dir, &config, "dashboard").await;
    }

    Ok(())
}

async fn generate_springboot_project(project_dir: &Path, config: &ProjectConfig, service_name: &str, spring_starters: &str, dependencies: &str) -> anyhow::Result<()> {
    println!("{} - com.{}.{}", "Generating Spring Boot project", &config.name, service_name);

    let spring_starters = if spring_starters.is_empty() { String::new() } else { format!(",{}", spring_starters) };

    // Creating request url
    let url = format!("https://start.spring.io/starter.zip?type=gradle-project&language=java&bootVersion={}&baseDir={}&groupId=com.{}&artifactId={}&name={}&description=SWoT%20{}%20service&packageName=com.{}.{}&packaging=jar&javaVersion={}&dependencies=actuator,lombok{}",
                      config.language.tool, service_name, &config.name, service_name, service_name, service_name, &config.name, service_name, config.language.version, spring_starters);

    // Downloading project
    println!("\tDownloading project from {}", url);
    let response = reqwest::get(&url).await?;
    let bytes = response.bytes().await?;

    // Unzipping project
    let mut archive = zip::ZipArchive::new(std::io::Cursor::new(bytes))?;
    archive.extract(project_dir)?;

    // Adding dependencies
    if !dependencies.is_empty() {
        let build_gradle_path = project_dir.join(service_name).join("build.gradle");
        println!("\tAdding dependencies to {}", build_gradle_path.display());
        let build_gradle_content = std::fs::read_to_string(&build_gradle_path)?;
        let new_build_gradle_content = format!("{}\n{}", build_gradle_content, dependencies);
        std::fs::write(&build_gradle_path, new_build_gradle_content)?;
    }

    println!("\tSpring boot resources for {}:{} ready!", &config.name, service_name);

    Ok(())
}

async fn copy_demo_resources(project_dir: &Path, config: &ProjectConfig, service_name: &str) -> anyhow::Result<()> {
    if !config.demo {
        println!("Demo resources not requested");
        return Ok(());
    }
    let resources_dir = utils::files::get_resources_dir();

    println!("\tCopying demo resources for {}:{}...", &config.name, service_name);

    let project_main_dir = project_dir.join(service_name).join("src").join("main").join("java").join("com").join(&config.name).join(service_name);
    let project_resources_dir = project_dir.join(service_name).join("src").join("main").join("resources");
    let project_test_dir = project_dir.join(service_name).join("src").join("test").join("java").join("com").join(&config.name).join(service_name);

    let demo_main_dir = resources_dir.join("java").join("demo").join(service_name).join("main");
    let demo_resources_dir = resources_dir.join("java").join("demo").join(service_name).join("resources");
    let demo_test_dir = resources_dir.join("java").join("demo").join(service_name).join("test");

    if demo_main_dir.exists() {
        println!("\t\tCopying main resources...");
        utils::files::copy_dir_recursive(&demo_main_dir, &project_main_dir, None).await?;
        replace_place_holder(&project_main_dir, "PackagePlaceHolder", &format!("com.{}.{}", &config.name, service_name)).await?;
    }

    if demo_test_dir.exists() {
        println!("\t\tCopying test resources...");
        utils::files::copy_dir_recursive(&demo_test_dir, &project_test_dir, None).await?;
        replace_place_holder(&project_test_dir, "PackagePlaceHolder", &format!("com.{}.{}", &config.name, service_name)).await?;
    }

    if demo_resources_dir.exists() {
        println!("\t\tCopying resources...");
        utils::files::copy_dir_recursive(&demo_resources_dir, &project_resources_dir, None).await?;
    }

    Ok(())
}

// Copy Dockerfiles from Resources/java/Dockerfiles -> ex: Dockerfile.mapper -> project_dir/mapper/Dockerfile
async fn copy_dockerfiles(project_dir: &Path, service_name: &str) -> anyhow::Result<()> {
    let dockerfiles_dir = utils::files::get_resources_dir().join("java").join("Dockerfiles");

    if dockerfiles_dir.exists() {
        println!("\tCopying Dockerfiles...");
        let dockerfile = dockerfiles_dir.join(format!("Dockerfile.{}", service_name));
        let project_dockerfile = project_dir.join(service_name).join("Dockerfile");
        fs::copy(&dockerfile, &project_dockerfile).await?;
    }

    Ok(())
}

// Function that recursively searches for a string in all files in a directory and its subdirectories and replaces it with another
fn replace_place_holder<'a>(
    project_dir: &'a Path,
    place_holder: &'a str,
    value: &'a str,
) -> Pin<Box<dyn Future<Output=anyhow::Result<()>> + 'a>> {
    Box::pin(async move {
        let mut entries = fs::read_dir(project_dir).await?;
        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();
            if path.is_dir() {
                replace_place_holder(&path, place_holder, value).await?;
            } else {
                let content = fs::read_to_string(&path).await?;
                let new_content = content.replace(place_holder, value);
                fs::write(&path, new_content).await?;
            }
        }
        Ok(())
    })
}