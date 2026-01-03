# Migración de microservicio Users de NestJS con Typeorm a Serverless Lambda con DynamoDB

## DynamoDB Local (pruebas)

Si ves `Error: connect ECONNREFUSED 127.0.0.1:8000`, significa que DynamoDB Local no está corriendo.

- Levantar DynamoDB Local (Docker): `npm run dynamodb:up`
- Crear la tabla usada por el servicio: `npm run dynamodb:init`
- Bajar el contenedor: `npm run dynamodb:down`

Requisitos:
- Docker + Docker Compose
- En tu `.env` (o variables de entorno): `DYNAMODB_ENDPOINT=http://localhost:8000` y `USERS_TABLE=users-service-db`
