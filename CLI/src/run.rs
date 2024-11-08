use anyhow::Result;
use std::path::PathBuf;
use std::process::Command;

pub async fn run_project(project_name: &str, refresh: bool) -> Result<()> {
    let project_dir = get_project_dir(project_name);

    if !project_dir.exists() {
        return Err(anyhow::anyhow!("Project {} not found", project_name));
    }

    if refresh {
        println!("Stopping containers...");
        stop_containers(&project_dir)?;

        println!("Removing images...");
        remove_images(&project_dir)?;

        println!("Rebuilding images without cache...");
        rebuild_images(&project_dir)?;
    }

    start_containers(&project_dir)?;

    Ok(())
}

fn get_project_dir(project_name: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("Projects")
        .join(project_name)
}

fn stop_containers(project_dir: &PathBuf) -> Result<()> {
    Command::new("docker-compose")
        .current_dir(project_dir)
        .arg("down")
        .status()?;
    Ok(())
}

fn remove_images(project_dir: &PathBuf) -> Result<()> {
    // Get project name from directory
    let project_name = project_dir
        .file_name()
        .unwrap()
        .to_str()
        .unwrap();

    // Remove all images with project prefix except jenna and mosquitto
    Command::new("docker")
        .args(&["images", "--format", "{{.ID}} {{.Repository}}", &format!("{}*", project_name)])
        .output()
        .map(|output| {
            String::from_utf8_lossy(&output.stdout)
                .split('\n')
                .filter(|line| !line.is_empty())
                .filter(|line| !line.contains("jena") && !line.contains("mosquitto"))
                .map(|line| line.split_whitespace().next().unwrap_or(""))
                .filter(|id| !id.is_empty())
                .for_each(|id| {
                    Command::new("docker")
                        .args(&["rmi", "-f", id])
                        .output()
                        .ok();
                });
        })?;


    Ok(())
}

fn rebuild_images(project_dir: &PathBuf) -> Result<()> {
    Command::new("docker-compose")
        .current_dir(project_dir)
        .args(&["build", "--no-cache"])
        .status()?;
    Ok(())
}

fn start_containers(project_dir: &PathBuf) -> Result<()> {
    Command::new("docker-compose")
        .current_dir(project_dir)
        .args(&["up", "-d", "--build"])
        .status()?;
    Ok(())
}