use std::future::Future;
use std::path::{Path, PathBuf};
use std::pin::Pin;
use tokio::fs;

pub(crate) fn copy_dir_recursive<'a>(
    src: &'a Path,
    dst: &'a Path,
    exclude_dir: Option<&'a str>,
) -> Pin<Box<dyn Future<Output=anyhow::Result<()>> + 'a>> {
    Box::pin(async move {
        if !src.exists() {
            return Ok(());
        }

        if let Some(exclude) = exclude_dir {
            if let Some(dir_name) = src.file_name() {
                if dir_name == exclude {
                    return Ok(());
                }
            }
        }

        fs::create_dir_all(dst).await?;

        let mut entries = fs::read_dir(src).await?;
        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();
            let dest_path = dst.join(path.file_name().unwrap());

            if path.is_dir() {
                copy_dir_recursive(&path, &dest_path, exclude_dir).await?;
            } else {
                fs::copy(&path, &dest_path).await?;
            }
        }

        Ok(())
    })
}

pub(crate) fn get_resources_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("Resources")
}

pub(crate) fn get_projects_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("Projects")
}