mod config;
mod init;
mod run;
mod initializer;
mod utils;

use anyhow::Result;
use clap::{Parser, Subcommand};


#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize a new SWoT project
    Init {
        /// Project name
        project_name: String,
        /// Add demo
        #[arg(long, default_value = "false")]
        no_demo: bool,
        /// Disable Apache Jena integration
        #[arg(long, default_value = "false")]
        no_jena: bool,
        /// Disable MQTT broker (Mosquitto)
        #[arg(long, default_value = "false")]
        no_mosquitto: bool,
        /// Disable sensor simulator
        #[arg(long, default_value = "false")]
        no_sensors: bool,
        /// Programming language (java, python, typescript)
        #[arg(long, default_value = "java")]
        lang: String,
        /// Language version
        #[arg(long, default_value = "")]
        lang_version: String,
        /// Framework or extension version (e.g. Spring Boot, Django, etc.)
        #[arg(long, default_value = "")]
        tool_version: String,
    },
    /// Run a SWoT project
    Run {
        /// Project name
        project_name: String,
        /// Rebuild and refresh containers
        #[arg(long)]
        refresh: bool,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();
    let cli = Cli::parse();

    match cli.command {
        Commands::Init {
            project_name,
            no_demo,
            no_jena,
            no_mosquitto,
            no_sensors,
            lang,
            lang_version,
            tool_version,
        } => {
            init::create_project(
                &project_name,
                !no_demo,
                !no_jena,
                !no_mosquitto,
                !no_sensors,
                &lang,
                &lang_version,
                &tool_version,
            ).await?;
        }
        Commands::Run {
            project_name,
            refresh,
        } => {
            run::run_project(&project_name, refresh).await?;
        }
    }

    Ok(())
}