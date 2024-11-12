use std::future::Future;
use std::env;
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

pub(crate) fn get_directory(dir_name: &str) -> PathBuf {
    // Primero intentamos con CARGO_MANIFEST_DIR (entorno de desarrollo)
    let cargo_dir = env::var("CARGO_MANIFEST_DIR").ok().map(PathBuf::from);
    
    if let Some(cargo_path) = cargo_dir {
        let dir_path = cargo_path.join(dir_name);
        if dir_path.exists() {
            return dir_path;
        }
    }

    // Si no existe, buscamos junto al ejecutable
    if let Ok(exe_path) = env::current_exe() {
        let exe_dir = exe_path.parent().unwrap_or(&exe_path);
        let dir_path = exe_dir.join(dir_name);
        if dir_path.exists() {
            return dir_path;
        }
    }

    // Si tampoco existe, buscamos en el directorio actual
    let current_dir = env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    current_dir.join(dir_name)
}

pub(crate) fn get_resources_dir() -> PathBuf {
    get_directory("Resources")
}

pub(crate) fn get_projects_dir() -> PathBuf {
    get_directory("Projects")
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::Path;
    
    #[test]
    fn test_get_resources_dir() {
        // Crear un directorio temporal para la prueba
        let temp_dir = env::temp_dir().join("swot_cli_test");
        fs::create_dir_all(&temp_dir).unwrap();
        let resources_dir = temp_dir.join("Resources");
        fs::create_dir_all(&resources_dir).unwrap();
        
        // Cambiar al directorio temporal
        let _guard = ChangeDirGuard::new(&temp_dir);
        
        // Verificar que podemos encontrar el directorio
        let found_dir = get_resources_dir();
        assert!(found_dir.ends_with("Resources"));
        assert!(found_dir.exists());
        
        // Limpiar
        fs::remove_dir_all(temp_dir).unwrap();
    }
    
    // Guard para cambiar de directorio temporalmente
    struct ChangeDirGuard {
        previous: PathBuf,
    }
    
    impl ChangeDirGuard {
        fn new(dir: &Path) -> Self {
            let previous = env::current_dir().unwrap();
            env::set_current_dir(dir).unwrap();
            Self { previous }
        }
    }
    
    impl Drop for ChangeDirGuard {
        fn drop(&mut self) {
            env::set_current_dir(&self.previous).unwrap();
        }
    }
}