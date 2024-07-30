#[macro_use]
extern crate rocket;
use std::collections::HashMap;
use std::fs::File;

use modbus_device::modbus_device_async::{ModbusConnexionAsync, ModbusDeviceAsync};
use modbus_device::types::TCPContext;
use modbus_device::utils::get_defs_from_json;
use rocket::fs::FileServer;
use rocket::response::Redirect;

use modbus_device;

extern crate custom_error;
use custom_error::custom_error;

custom_error! {RegisterDoesNotExistError
    NotFound{reg:String} = "Register {reg} does not exist on the definition"
}

async fn start_electrolyzer() -> Result<String, Box<dyn std::error::Error>> {
    let mut device = ModbusDeviceAsync::new(
        TCPContext {
            addr: "127.0.0.1:4502".parse()?,
        }
        .into(),
        HashMap::new(),
        get_defs_from_json(File::open("holding_registers.json")?)?,
    );
    device.connect().await?;

    let start_register = &device
        .get_holding_register_by_name("Electrolyze".to_string())
        .ok_or(RegisterDoesNotExistError::NotFound {
            reg: "Electrolyze".to_string(),
        })?
        .clone();

    let res = device
        .write_holding_register(
            start_register.clone(),
            modbus_device::types::RegisterValue::Boolean(true),
        )
        .await;

    match res {
        Ok(_) => Ok("".to_string()),
        Err(_) => Err(Box::new(RegisterDoesNotExistError::NotFound {
            reg: "hjqdsghgs".to_string(),
        })),
    }
}

#[get("/start")]
async fn start() -> String {
    match start_electrolyzer().await {
        Ok(val) => val,
        Err(err) => return format!("Could not initiate connexion to the modbus device {err}"),
    }
}

#[get("/")]
fn index() -> Redirect {
    Redirect::to(uri!("/index.html"))
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index])
        .mount("/", FileServer::from("./static"))
        .mount("/start", routes![start])
}
