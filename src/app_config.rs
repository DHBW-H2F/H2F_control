use serde::Deserialize;
#[derive(Deserialize, Debug)]
/// The `AppConfig` struct in Rust contains fields for logo IP and logo registers as strings.
/// 
/// @property {String} logo_ip - the IP of the logo
/// 
/// @property {String} logo_registers - The path to the Logo registers file
pub struct AppConfig {
    pub logo_ip: String,
    pub logo_registers: String,
}