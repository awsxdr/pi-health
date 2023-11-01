use std::sync::Arc;
use futures_util::lock::Mutex;
use warp::Filter;

use crate::health_check::HealthCheck;

pub struct ApiServer {
    health_check_service: Arc<Mutex<HealthCheck>>,
}

impl ApiServer {
    pub fn new(health_check_service: HealthCheck) -> ApiServer {
        ApiServer {
            health_check_service: Arc::new(Mutex::new(health_check_service))
        }
    }

    pub async fn listen(&self, port: u16) {
        let cloned_health_check = self.health_check_service.clone();
        let health_check_service = warp::any().map(move || cloned_health_check.clone());

        let filter = 
            warp::path::end()
            .and(health_check_service)
            .and_then(Self::handle_request);

        let cors_configuration =
            warp::cors()
                .allow_any_origin()
                .allow_methods(vec!["GET", "OPTIONS"]);

        let routes =
            filter
            .with(cors_configuration);

        warp::serve(routes).run(([0, 0, 0, 0], port)).await;
    }

    async fn handle_request(health_check_service: Arc<Mutex<HealthCheck>>) -> Result<Box<dyn warp::Reply>, warp::Rejection> {
        let health = health_check_service.lock().await.get_current_health().await;

        Ok(Box::new(warp::reply::json(&health)))
    }
}