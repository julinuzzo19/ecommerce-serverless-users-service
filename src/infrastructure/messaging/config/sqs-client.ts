import { SQSClient } from "@aws-sdk/client-sqs";

/**
 * Factory para crear el cliente de SQS configurado apropiadamente
 * según el ambiente (local vs producción)
 */
export function createSQSClient(): SQSClient {
  const isLocal = process.env.NODE_ENV === "development";

  if (isLocal) {
    return new SQSClient({
      region: "us-east-1",
      endpoint: "http://localhost:4566",
      credentials: {
        accessKeyId: "test",
        secretAccessKey: "test",
      },
    });
  }

  // En producción, usa las credenciales del IAM role asignado al servicio
  return new SQSClient({
    region: process.env.AWS_REGION || "us-east-1",
  });
}

/**
 * Mapeo de canales lógicos a URLs de colas SQS
 * En producción, estas vendrían de variables de entorno o Systems Manager
 */
export function getQueueUrlMap(): Record<string, string> {
  const isLocal = process.env.NODE_ENV === "development";

  if (isLocal) {
    return {
      "user-created-queue":
        "http://localhost:4566/000000000000/user-created-queue",
    };
  }

  return {
    "user-created": process.env.USER_CREATED_QUEUE_URL!,
  };
}
