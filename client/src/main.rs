mod api_server;
mod health_check;

use api_server::ApiServer;
use clap::Parser;
use log::LevelFilter;
use simplelog::{CombinedLogger, TermLogger, Config, TerminalMode, ColorChoice};
use systemstat::{System, Platform};

use crate::health_check::HealthCheck;

#[derive(Parser, Debug)]
struct CommandLineArguments {
    #[arg(short = 'p', long = "port", default_value_t = 8002)]
    host_port: u16,

    #[arg(long = "logLevel", default_value = "info")]
    log_level: String,
}

#[tokio::main]
async fn main() {
    let arguments = CommandLineArguments::parse();

    let log_level = parse_log_level(arguments.log_level.as_str());
    CombinedLogger::init(
        vec![
            TermLogger::new(log_level, Config::default(), TerminalMode::Mixed, ColorChoice::Auto),
        ]
    ).unwrap();

    let system_info = System::new();
    let health_check = HealthCheck::new(system_info);
    let api_server = ApiServer::new(health_check);

    api_server.listen(arguments.host_port).await;
}

fn parse_log_level(level: &str) -> LevelFilter {
    match level.to_ascii_lowercase().as_str() {
        "trace" => LevelFilter::Trace,
        "debug" => LevelFilter::Debug,
        "info" => LevelFilter::Info,
        "warn" => LevelFilter::Warn,
        "error" => LevelFilter::Error,
        "none" => LevelFilter::Off,
        _ => LevelFilter::Info
    }
}