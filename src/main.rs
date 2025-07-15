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

use serde::Serialize;

use std::fs::File;
use std::sync::Arc;





// TODO: Add Reboot button

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

fn create_s7_device(app_ip : String,regs_file : File) -> S7Device{
    let device = S7Device::new(
        match app_ip.parse() {
            Ok(val) => val,
            Err(err) => panic!(
                "Could not parse controller adress : {err:?} ({0})",
                app_ip
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
//--------------------------------------------------------------
// route function


use custom_error::custom_error;

custom_error! {PoisonedMutexError{err: String} = "Could not aquire lock ({err})"}
struct AppState {
    logo: Arc<Mutex<S7Device>>,
    //compressor: Arc<Mutex<S7Device>>,
}
#[derive(Serialize)]
struct CompressorState {
    state: String,
}

fn convert(valeur : Value) -> String{
    match valeur {
        Value::Enum16(val)=>val.to_string(),
        Value::Float32(val)=>val.to_string(),
        _ => "bad type".to_owned(),
    }
}

#[get("/start")]
async fn start_project(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res = send_command_write(&state.logo.clone(), "Start/Stop", &Value::Boolean(true)).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}
#[get("/electrolyzer/start")]
async fn start_electrolyzer(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res = send_command_write(&state.logo.clone(), "Start/Stop_electro", &Value::Boolean(true)).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }

}
#[get("/compressor/start")]
async fn start_compressor(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res = send_command_write(&state.logo.clone(), "Start/Stop_compressor", &Value::Boolean(true)).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}




#[get("/stop")]
async fn stop_project(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res = send_command_write(&state.logo.clone(), "Start/Stop", &Value::Boolean(false)).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}
#[get("/electrolyzer/stop")]
async fn stop_electrolyzer(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res = send_command_write(&state.logo.clone(), "Start/Stop_electro", &Value::Boolean(false)).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }

}
#[get("/compressor/stop")]
async fn stop_compressor(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res = send_command_write(&state.logo.clone(), "Start/Stop_compressor", &Value::Boolean(false)).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}

#[put("/electrolyser/prodRate?<rate>")]
async fn prod_rate(rate: f32, state: &State<AppState>) -> Result<(), Custom<String>> {
    let res = send_command_write(&  state.logo.clone(),"Production_rate", &Value::Float32(rate)).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}


#[get("/restart")]
async fn restart_project(state: &State<AppState>) -> Result<(), Custom<String>> {
    send_command_write(&state.logo.clone(),"Restart", &Value::Boolean(true)).await;
    let res = send_command_write(&state.logo.clone(),"Restart", &Value::Boolean(false)).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}
#[get("/electrolyzer/restart")]
async fn restart_electrolyzer(state: &State<AppState>) -> Result<(), Custom<String>> {
    send_command_write(&state.logo.clone(),"Restart_electro", &Value::Boolean(true)).await;
    let res = send_command_write(&state.logo.clone(),"Restart_electro", &Value::Boolean(false)).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }

}
#[get("/compressor/restart")]
async fn restart_compressor(state: &State<AppState>) -> Result<(), Custom<String>> {
    send_command_write(&state.logo.clone(),"Restart_compressor", &Value::Boolean(true)).await;
    let res=send_command_write(&state.logo.clone(),"Restart_compressor", &Value::Boolean(false)).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}
#[get("/compressor/state")]
async fn get_state_compressor(state: &State<AppState>) -> status::Accepted<String> {
    let res = send_command_read(&state.logo.clone(), "status_compr").await;
    let result = match res {
        Ok(value) => convert(value),
        Err(_) => "none".to_owned(),
    };
    return status::Accepted(format!("state: '{}'", result));
}
#[get("/electrolyser/state")]
async fn get_state_electrolyser(state: &State<AppState>) -> status::Accepted<String> {
    !println("state electrolyser");
    let res = send_command_read(&state.logo.clone(),"status_electro").await;
    let result = match res {
        Ok(value) => convert(value),
        Err(_) => "none".to_owned(),
    };
    return status::Accepted(format!("state: '{}'", result));
}
#[get("/electrolyser/prodValue")]
async fn get_prod_value_electrolyser(state: &State<AppState>) -> status::Accepted<String> {
    let res = send_command_read(&state.logo.clone(),"prodValue_electro").await;
    let result = match res {
        Ok(value) => convert(value),
        Err(_) => "none".to_owned(),
    };
    return status::Accepted(format!("state: '{}'", result));
}
#[get("/compressor/prodValue")]
async fn get_prod_value_compressor(state: &State<AppState>) -> status::Accepted<String> {
    !println("prodValue compressor");
    let res = send_command_read(&state.logo.clone(),"prodValue_compr").await;
    let result = match res {
        Ok(value) => convert(value),
        Err(_) => "none".to_owned(),
    };
    return status::Accepted(format!("state: '{}'", result));
}

#[get("/")]
fn index() -> Redirect {
    Redirect::to(uri!("/LiveDashboard.html"))
}
//--------------------------------------------------------------
//--------------------------------------------------------------









#[launch]
fn rocket() -> _ {
    let args = Args::parse();

    let config = config::Config::builder()
        .add_source(config::File::with_name(&args.config_file))
        .build()
        .unwrap();

    let app: AppConfig = config.try_deserialize().unwrap();
    //let regs_logo = get_regs_file(app.logo_registers);
    //let logo_device = create_s7_device(app.logo_ip, regs_logo);
    let regs_file: File = match File::open(&app.logo_registers) {
        Ok(file) => file,
        Err(err) => panic!(
            "Could not open registers definition file : {err} ({0})",
            app.logo_registers
        ),
    };
    println!("{:?}", regs_file);
    let logo_device = S7Device::new(
        match app.logo_ip.parse() {
            Ok(val) => val,
            Err(err) => panic!(
                "Could not parse controller adress : {err:?} ({0})",
                app.logo_ip
            ),
        },
        match s7_device::utils::get_defs_from_json(regs_file) {
            Ok(regs) => regs,
            Err(err) => {
                panic!("There was an error reading registers definition from file : ({0})",err)
            }
        },
    );

    //let regs_compressor: File = get_regs_file(app.compressor_registers);
    //let compressor_device = create_s7_device(app.compressor_ip,regs_compressor);
    rocket::build()
        .mount("/", routes![index])
        .mount("/", FileServer::from("./static"))
        .mount("/start", routes![start_project])
        .mount("/stop", routes![stop_project])
        .mount("/restart", routes![restart_project])

        .mount("/compressor/start", routes![start_compressor])
        .mount("/compressor/stop", routes![stop_compressor])
        .mount("/compressor/restart", routes![restart_compressor])
        .mount("/compressor/state", routes![get_state_compressor])
        .mount("/compressor/prodValue", routes![get_prod_value_compressor])

        .mount("/electrolyser/start", routes![start_electrolyzer])
        .mount("/electrolyser/stop", routes![stop_electrolyzer])
        .mount("/electrolyser/restart", routes![restart_electrolyzer])
        .mount("/electrolyser/prodRate", routes![prod_rate])
        .mount("/electrolyser/state", routes![get_state_electrolyser])
        .mount("/electrolyser/prodValue", routes![get_prod_value_electrolyser])

        .manage(AppState {
                logo: Arc::new(Mutex::new(logo_device)),
                //compressor: Arc::new(Mutex::new(compressor_device)),
        })
}
