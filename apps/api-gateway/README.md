# API Gateway

Central routing and orchestration layer for the inventory counting system.

## Features

- **Proxy routing** to 5 upstream services (auth, inventory, counting, ERP gateway, ERP mock)
- **CORS** support for browser requests
- **Rate limiting** (100 requests/min)
- **Health checks** with upstream service monitoring
- **Graceful shutdown** with SIGTERM/SIGINT handling
- **Structured logging** with Pino

## Endpoints

| Route | Target Service |
|-------|--------|
| `/auth/*` | Auth Service (3001) |
| `/items/*` | Inventory Service (3002) |
| `/stock/*` | Inventory Service (3002) |
| `/sync/*` | Inventory Service (3002) |
| `/sessions/*` | Counting Service (3003) |
| `/health` | API Gateway |

## Quick Start

```bash
# Install dependencies
pnpm install

# Run in development
pnpm dev

# Build
pnpm build

# Start production
pnpm start

# Run tests
pnpm test
```

## Configuration

Environment variables:

```bash
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
AUTH_SERVICE_URL=http://localhost:3001
INVENTORY_SERVICE_URL=http://localhost:3002
COUNTING_SERVICE_URL=http://localhost:3003
ERP_GATEWAY_URL=http://localhost:3004
ERP_MOCK_URL=http://localhost:3005
CORS_ORIGIN=*
```

## Health Check

```bash
curl http://localhost:3000/health
# {
#   "status": "ok",
#   "service": "api-gateway",
#   "upstream": {
#     "auth": "ok",
#     "inventory": "ok",
#     "counting": "ok",
#     "erpGateway": "ok",
#     "erpMock": "ok"
#   }
# }
```

## Docker

```bash
docker build -t api-gateway .
docker run -p 3000:3000 api-gateway
```

## Testing

```bash
pnpm test                    # Run tests
pnpm test --watch          # Watch mode
pnpm test --coverage       # Coverage report
```
