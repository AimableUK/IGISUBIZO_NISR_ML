## Docker Networking

The development and production Compose files define the service names and
networking used by this repository. Keep service-to-service URLs pointed at
Compose service names, not `localhost`.

When the application is running through Docker Compose, services must communicate with each other using their Docker Compose service names, not localhost.

### Container-to-Container Communication

Use these service names for internal communication:

- web → Next.js frontend
- api → Node.js/TypeScript API
- postgres → PostgreSQL database
- redis → Redis

The `model/` directory currently contains Docker templates only and is not a
Compose service. Add it to Compose after the model application and API
contract exist.

Examples:

API → PostgreSQL
postgresql://isesengura:isesengura@postgres:5432/isesengura

API → Redis
redis://redis:6379

Never use these from inside a Docker container:

http://localhost:8000
localhost:5432
localhost:6379

Inside a container, localhost refers to that same container, not another Docker service.

### Host Machine / Browser Communication

When communicating from the developer's browser or host machine to exposed Docker services, use localhost and the exposed port:

Web app       → http://localhost:3000
API           → http://localhost:4000
PostgreSQL    → localhost:5432
Redis         → localhost:6379

### Environment Variable Distinction

The configuration must distinguish between container-side and browser-side URLs.

For services running inside Docker:

DATABASE_URL=postgresql://isesengura:isesengura@postgres:5432/isesengura
REDIS_URL=redis://redis:6379

For browser-side Next.js communication:

NEXT_PUBLIC_API_URL=http://localhost:4000

The NEXT_PUBLIC_* URL is consumed by the browser, so it must point to the host-accessible backend address rather than the Docker service name.

### General Rule

Always determine where the request originates before choosing the hostname:

Browser / Host Machine
        ↓
localhost:<exposed-port>

Docker Container
        ↓
<docker-compose-service-name>:<container-port>

Therefore:

Browser → Backend
http://localhost:4000

API → PostgreSQL
postgresql://isesengura:isesengura@postgres:5432/isesengura

API → Redis
redis://redis:6379

Do not change this networking model when modifying application code. Preserve the existing Docker Compose service names, ports, network, and environment-variable conventions unless a change is explicitly required.
