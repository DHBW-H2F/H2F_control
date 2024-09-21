#[macro_use]
extern crate rocket;
use core::panic;
use std::fs::File;
use std::sync::Arc;

use rocket::futures::lock::Mutex;
use rocket::http::Status;
use rocket::response::status::Custom;
use rocket::State;
use s7_device::S7Device;

use rocket::fs::FileServer;
use rocket::response::Redirect;

mod control;

mod app_config;
use app_config::AppConfig;

use clap::Parser;

struct AppState {
    device: Arc<Mutex<S7Device>>,
}

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

#[get("/")]
async fn start(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res = control::start_electrolyzer(state.device.clone()).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}
#[get("/")]
async fn stop(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res = control::stop_electrolyzer(state.device.clone()).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}
#[get("/?<rate>")]
async fn prod_rate(rate: f32, state: &State<AppState>) -> Result<(), Custom<String>> {
    let res = control::set_rate(state.device.clone(), rate).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}
#[get("/")]
async fn restart(state: &State<AppState>) -> Result<(), Custom<String>> {
    let res = control::restart_electrolyzer(state.device.clone()).await;
    match res {
        Ok(_) => Ok(()),
        Err(err) => Err(Custom(Status::InternalServerError, format!("{err:?}"))),
    }
}

#[get("/")]
fn index() -> Redirect {
    Redirect::to(uri!("/LiveDashboard.html"))
}

#[launch]
fn rocket() -> _ {
    let args = Args::parse();

    let config = config::Config::builder()
        .add_source(config::File::with_name(&args.config_file))
        .build()
        .unwrap();

    let app: AppConfig = config.try_deserialize().unwrap();

    let regs_file: File = match File::open(&app.controller_registers) {
        Ok(file) => file,
        Err(err) => panic!(
            "Could not open registers definition file : {err} ({0})",
            app.controller_registers
        ),
    };

    let device = S7Device::new(
        match app.controller_ip.parse() {
            Ok(val) => val,
            Err(err) => panic!(
                "Could not parse controller adress : {err:?} ({0})",
                app.controller_ip
            ),
        },
        match s7_device::utils::get_defs_from_json(regs_file) {
            Ok(regs) => regs,
            Err(err) => {
                panic!("There was an error reading registers definition from file : {err:?}")
            }
        },
    );

    rocket::build()
        .mount("/", routes![index])
        .mount("/", FileServer::from("./static"))
        .mount("/start", routes![start])
        .mount("/stop", routes![stop])
        .mount("/prodRate", routes![prod_rate])
        .mount("/restart", routes![restart])
        .manage(AppState {
            device: Arc::new(Mutex::new(device)),
        })
}
