use std::fs;
use std::path::PathBuf;
use tauri::Manager;

// Test Rust connection
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Save tasks to local file
#[tauri::command]
fn save_tasks(app: tauri::AppHandle, tasks: String) -> Result<(), String> {
    let mut file_path: PathBuf = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    fs::create_dir_all(&file_path)
        .map_err(|e| e.to_string())?;

    file_path.push("tasks.json");

    fs::write(file_path, tasks)
        .map_err(|e| e.to_string())?;

    Ok(())
}

// Load tasks from local file
#[tauri::command]
fn load_tasks(app: tauri::AppHandle) -> Result<String, String> {
    let mut file_path: PathBuf = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    file_path.push("tasks.json");

    if !file_path.exists() {
        return Ok("[]".to_string());
    }

    let tasks = fs::read_to_string(file_path)
        .map_err(|e| e.to_string())?;

    Ok(tasks)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            save_tasks,
            load_tasks
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}