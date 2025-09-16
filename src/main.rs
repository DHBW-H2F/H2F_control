#[macro_use]
extern crate rocket;

mod app_config;
use app_config::AppConfig;

use clap::Parser;
mod control;
use control::send_command_read;
use control::send_command_write;
use core::panic;

use industrial_device::types::Value;


use rocket::http::Status;
use rocket::fs::FileServer;
use rocket::futures::lock::Mutex;
use rocket::response::Redirect;
use rocket::response::status;
use rocket::response::status::Custom;
use rocket::State;

use s7_device::S7Device;

use std::fs::File;
use std::sync::Arc;





#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    #[arg(
        short,
        long,
        default_value = "config.yaml",
        help = "Config path",
        long_help = "Where to find the config file"
    )]
    config_file: String,
}


/// The function `get_regs_file` opens a file specified by the `file_path` parameter and returns a
/// `File` object.
/// 
/// @param {String} the path to the file that contains register definitions.
/// 
/// @returns `File` object, which represents the file opened at the specified `file_path`.
fn get_regs_file(file_path : String) -> File {
    let regs_file: File = match File::open(&file_path) {
        Ok(file) => file,
        Err(err) => panic!(
            "Could not open registers definition file : {err} ({0})",
            file_path
        ),
    };
    return regs_file;
}

/// The function `create_s7_device` creates a new S7Device instance using the provided application IP
/// address and registers file.
/// 
/// @param {String} the IP address of the device.
/// 
/// @param {File} file containing register definitions that will be called by the S7Device object to the device.
/// 
/// @returns An instance of `S7Device` after creating it with the provided application IP address and registers file.
/// 
/// 
fn create_s7_device(ip_device : String,regs_file : File) -> S7Device{
    let device = S7Device::new(
        match ip_device.parse() {
            Ok(val) => val,
            Err(err) => panic!(
                "Could not parse controller adress : {err:?} ({0})",
                ip_device
            ),
        },
        match s7_device::utils::get_defs_from_json(regs_file) {
            Ok(regs) => regs,
            Err(err) => {
                panic!("There was an error reading registers definition from file : {err}")
            }
        },
    );
    return device;
}
use custom_error::custom_error;

custom_error! {PoisonedMutexError{err: String} = "Could not aquire lock ({err})"}

/// The `AppState` struct contains a shared, thread-safe reference to an `S7Device` wrapped in an `Arc`
/// and `Mutex`.
struct AppState {
    logo: Arc<Mutex<S7Device>>,
}


/// The `convert` function in Rust takes the value result of the device and transform it to send back to the front
/// 
/// @param {Value} result - The parameter `result` is of type `Value`, which is an enum type with variants `S16` and `Float32`.
/// 
/// @returns The function `convert` returns a `String` value.
fn convert(result : Value) -> String{
    match result {
        Value::S16(val)=>val.to_string(),
        Value::Float32(val)=>val.to_string(),
        _ => "bad type".to_owned(),
    }
}


//--------------------------------------------------------------
/// route function
/// 
/// http protocol : `get`
#[get("/start")]
async fn start_project(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res1 = start_electrolyzer(state).await;
    match res1 {
        Ok(_) => {
            let res2 = start_compressor(state).await;
            return match res2 {
                Ok(_) => Ok(()),
                 // if the start of the compressor fail, we stop also the electrolyser
                Err(err) => {
                    stop_electrolyzer(state).await;
                    return Err(Custom(Status::InternalServerError, format!("{err:?}")))
                },
            }
        },
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}
/// route function
/// 
/// http protocol : `get`
#[get("/start")]
async fn start_electrolyzer(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res = send_command_write(&state.logo.clone(), "Start_Stop_compressor", &Value::Boolean(true)).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }

}
/// route function
/// 
/// http protocol : `get`
#[get("/start")]
async fn start_compressor(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res = send_command_write(&state.logo.clone(), "Start_Stop_compressorw", &Value::Boolean(true)).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}

/// route function
/// 
/// http protocol : `get`
#[get("/stop")]
async fn stop_project(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res1 = stop_compressor(state).await;
    let res2 = stop_electrolyzer(state).await;
    match res1 {
        Ok(_) => {
            return match res2 {
                Ok(_) => Ok(()),
                Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
            }
        },
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}
/// route function
/// 
/// http protocol : `get`
#[get("/stop")]
async fn stop_electrolyzer(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res = send_command_write(&state.logo.clone(), "Start_Stop_electro", &Value::Boolean(false)).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }

}
/// route function
/// 
/// http protocol : `get`
#[get("/stop")]
async fn stop_compressor(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res = send_command_write(&state.logo.clone(), "Start_Stop_compressor", &Value::Boolean(false)).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}
/// route function
/// 
/// http protocol : `get`
#[get("/clean_error")]
async fn clean_error_project(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res1 = clean_error_electrolyser(state).await;
    let res2 = clean_error_compressor(state).await;
    match res1 {
        Ok(_) => {
            return match res2 {
                Ok(_) => Ok(()),
                Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
            }
        },
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}
/// route function
/// 
/// http protocol : `get`
#[get("/clean_error")]
async fn clean_error_compressor(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res1 = send_command_write(&state.logo.clone(),"Restart_compressor", &Value::Boolean(true)).await;
    let res2 = send_command_write(&state.logo.clone(),"Restart_compressor", &Value::Boolean(false)).await;
    match res1 {
        Ok(_) => {
            return match res2 {
                Ok(_) => Ok(()),
                Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
            }
        },
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}
/// route function
/// 
/// http protocol : `get`
#[get("/clean_error")]
async fn clean_error_electrolyser(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res1 = send_command_write(&state.logo.clone(),"Restart_electro", &Value::Boolean(true)).await;
    let res2 = send_command_write(&state.logo.clone(),"Restart_electro", &Value::Boolean(false)).await;
    match res1 {
        Ok(_) => {
            return match res2 {
                Ok(_) => Ok(()),
                Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
            }
        },
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}
/// route function
/// 
/// @param {rate} rate - The parameter `rate` is of type `float 32 bits` represents the production rate we want to send to the electrolyser.
/// 
/// http protocol : `put`
#[put("/prodRate?<rate>")]
async fn prod_rate(rate: f32, state: &State<AppState>) -> Result<(), Custom<String>> {
    let res = send_command_write(&  state.logo.clone(),"Production_rate", &Value::Float32(rate)).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}
/// route function
/// 
/// http protocol : `get`
#[get("/state")]
async fn get_state_compressor(state: &State<AppState>) -> status::Accepted<String> {
    let res = send_command_read(&state.logo.clone(), "Status_compr").await;
    let result = match res {
        Ok(value) => convert(value),
        Err(_) => "none".to_owned(),
    };
    return status::Accepted(format!("{{\"state\": \"{}\"}}", result));
}
/// route function
/// 
/// http protocol : `get`
#[get("/state")]
async fn get_state_electrolyser(state: &State<AppState>) -> status::Accepted<String> {
    let res = send_command_read(&state.logo.clone(),"Status_electro").await;
    let result = match res {
        Ok(value) => convert(value),
        Err(err) => "none".to_owned(),
    };
    return status::Accepted(format!("{{\"state\": \"{}\"}}", result));
}
/// route function
/// 
/// http protocol : `get`
#[get("/prodValue")]
async fn get_prod_value_electrolyser(state: &State<AppState>) -> status::Accepted<String> {
    let res = send_command_read(&state.logo.clone(),"ProdValue_electro").await;

    let result = match res {
        Ok(value) => convert(value),
        Err(err) => "none".to_owned(),
    };
    return status::Accepted(format!("{{\"value\": \"{}\"}}", result));
}
/// route function
/// 
/// http protocol : `get`
#[get("/prodValue")]
async fn get_prod_value_compressor(state: &State<AppState>) -> status::Accepted<String> {
    let res = send_command_read(&state.logo.clone(),"ProdValue_compr").await;
    
    let result = match res {
        Ok(value) => convert(value),
        Err(_) => "none".to_owned(),
    };
    return status::Accepted(format!("{{\"value\": \"{}\"}}", result));
}
/// default route
/// 
/// http protocol : `get`
#[get("/")]
fn index() -> Redirect {
    Redirect::to(uri!("/LiveDashboard.html"))
}
//--------------------------------------------------------------
//--------------------------------------------------------------


/// the `main` function of the app
#[launch]
fn rocket() -> _ {
    let args = Args::parse();

    let config = config::Config::builder()
        .add_source(config::File::with_name(&args.config_file))
        .build()
        .unwrap();

    let app: AppConfig = config.try_deserialize().unwrap();
    let regs_logo = get_regs_file(app.logo_registers);
    let logo_device = create_s7_device(app.logo_ip, regs_logo);

    // build the API route
    rocket::build()
        .mount("/", routes![index])
        .mount("/", FileServer::from("./static"))
        .mount("/", routes![start_project])
        .mount("/", routes![stop_project])
        .mount("/", routes![clean_error_project])

        .mount("/compressor", routes![start_compressor])
        .mount("/compressor", routes![stop_compressor])
        .mount("/compressor", routes![clean_error_compressor])
        .mount("/compressor", routes![get_state_compressor])
        .mount("/compressor", routes![get_prod_value_compressor])
        

        .mount("/electrolyser", routes![start_electrolyzer])
        .mount("/electrolyser", routes![stop_electrolyzer])
        .mount("/electrolyser", routes![clean_error_electrolyser])
        .mount("/electrolyser", routes![prod_rate])
        .mount("/electrolyser", routes![get_state_electrolyser])
        .mount("/electrolyser", routes![get_prod_value_electrolyser])

        .manage(AppState {
                logo: Arc::new(Mutex::new(logo_device)),
        })
}