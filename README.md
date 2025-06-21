# RecruSmart Platform

This project consists of multiple microservices for a recruitment platform. Services are written in Node.js, Spring Boot, and Python and communicate via RabbitMQ. An Nginx gateway exposes the APIs and a frontend app provides the web UI.

## Development using Docker Compose

All services can be started locally using Docker Compose:

```bash
cd backend
docker compose up --build
```

## Deploying to Kubernetes

Kubernetes manifests are provided in the `k8s/` directory. To deploy the entire stack to a cluster run:

```bash
kubectl apply -f k8s/recrusmart.yaml
```

The API gateway and frontend are exposed via `NodePort` services by default.

## API route map

For convenience the repository includes a small script that scans the backend
routes and generates a JSON file listing all available endpoints. Run it with:

```bash
node scripts/generateApiRoutes.js
```

The script outputs `frontend/src/apiRoutes.json` which can be used in the
frontend to discover and test the services' APIs.
