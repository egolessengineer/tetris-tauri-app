use std::env;
use reqwest::blocking::Client;
use serde_json::json;
use tauri_plugin_dialog::{MessageDialogKind};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Check for the presence of the `--tymt` argument followed by a token
    let args: Vec<String> = env::args().collect();
    if let Some(index) = args.iter().position(|arg| arg == "--tymt") {
        if let Some(token) = args.get(index + 1) {
            // Make a POST request to /api/auth/game/session
            let client = Client::new();
            let response = client
                .post("https://dev.tymt.com/api/auth/game/session")
                .json(&json!({ "drmToken": token }))
                .send();

            match response {
                Ok(res) => {
                    let status = res.status();
                    let body = res.text().unwrap_or_else(|_| "Failed to read response body.".to_string());
                    let output = format!("Status: {}\nResponse: {}", status, body);
                    std::fs::write("response.txt", &output).expect("Unable to write to file");

                    if status.is_success() {
                        println!("Session created successfully. Response written to response.txt.");
                    } else {
                        eprintln!("Failed to create session. Response written to response.txt.");
                        std::process::exit(1); // Terminate the program
                    }
                }
                Err(err) => {
                    let error_message = format!("Error while making the request: {:?}", err);
                    std::fs::write("response.txt", &error_message).expect("Unable to write to file");
                    eprintln!("Error while making the request. Details written to response.txt.");
                    std::process::exit(1); // Terminate the program
                }
            }

            tauri::Builder::default()
                .plugin(tauri_plugin_opener::init())
                .invoke_handler(tauri::generate_handler![greet])
                .run(tauri::generate_context!())
                .expect("error while running tauri application");
            return;
        }
    }
    eprintln!("The application can only be run with the --tymt argument followed by a token.");
}