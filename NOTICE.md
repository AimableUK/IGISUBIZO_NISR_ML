## Docker Networking

The development Compose file defines the service names and networking used by this repository. Keep service-to-service URLs pointed at Compose service names, not `localhost`.

When the application is running through Docker Compose, services must communicate with each other using their Docker Compose service names, not localhost.

### Container-to-Container Communication

Use these service names for internal communication:

- `web` → Next.js frontend
- `api` → Node.js/TypeScript API
- `model` → Python analytical/model service
- `postgres` → PostgreSQL database
- `redis` → Redis

Examples:

```text
API → PostgreSQL    postgresql://mboni:mboni@postgres:5432/mboni
API → Redis         redis://redis:6379
API → Model         http://model:8000
Model → API         http://api:4000
```

The `mboni:mboni` database credentials are for local development only. Never reuse them in production.

Never use these from inside a Docker container to reach another service:

```text
http://localhost:8000
http://localhost:4000
localhost:5432
localhost:6379
```

Inside a container, `localhost` refers to that same container, not another Docker service.

### Host Machine / Browser Communication

When communicating from the developer's browser or host machine to exposed Docker services, use `localhost` and the exposed port:

```text
Web app       → http://localhost:3000
API           → http://localhost:4000
Model         → http://localhost:8000
PostgreSQL    → localhost:5432
Redis         → localhost:6379
```

### Environment Variable Distinction

The configuration must distinguish between container-side and browser-side URLs.

For services running inside Docker:

```text
DATABASE_URL=postgresql://mboni:mboni@postgres:5432/mboni
REDIS_URL=redis://redis:6379
MODEL_URL=http://model:8000
```

For the model service reaching the API:

```text
API_URL=http://api:4000
```

For the API's own public addresses (used for links and redirects that a browser follows):

```text
API_URL=http://localhost:4000
WEB_URL=http://localhost:3000
```

For browser-side Next.js communication:

```text
NEXT_PUBLIC_API_URL=http://localhost:4000
```

The `NEXT_PUBLIC_*` URL is consumed by the browser, so it must point to the host-accessible backend address rather than the Docker service name.

Note that `API_URL` has a different meaning per service: in `model` it is the container-side address of the API (`http://api:4000`), while in `api` it is the API's public address (`http://localhost:4000`). Do not copy one value into the other.

### General Rule

Always determine where the request originates before choosing the hostname:

```text
Browser / Host Machine
        ↓
localhost:<exposed-port>

Docker Container
        ↓
<docker-compose-service-name>:<container-port>
```

Therefore:

```text
Browser → Backend    http://localhost:4000
API → PostgreSQL     postgresql://mboni:mboni@postgres:5432/mboni
API → Redis          redis://redis:6379
API → Model          http://model:8000
```

Do not change this networking model when modifying application code. Preserve the existing Docker Compose service names, ports, network, and environment-variable conventions unless a change is explicitly required.
