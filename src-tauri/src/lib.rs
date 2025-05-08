use std::env;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Check for the presence of the `--tymt` argument followed by `12345`
    let args: Vec<String> = env::args().collect();
    if let Some(index) = args.iter().position(|arg| arg == "--tymt") {
        if args.get(index + 1) == Some(&"12345".to_string()) {
            tauri::Builder::default()
                .plugin(tauri_plugin_opener::init())
                .invoke_handler(tauri::generate_handler![greet])
                .run(tauri::generate_context!())
                .expect("error while running tauri application");
            return;
        }
    }
    eprintln!("The application can only be run with the --tymt argument followed by 12345.");
}
