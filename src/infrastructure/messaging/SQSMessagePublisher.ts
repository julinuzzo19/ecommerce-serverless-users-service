// src/infrastructure/messaging/SQSMessagePublisher.ts

import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
} from "@aws-sdk/client-sqs";
import { IMessagePublisher } from "../../services/ports/IMessagePublisher";

/**
 * Configuración para el publisher de SQS
 */
interface SQSPublisherConfig {
  queueUrlMap: Record<string, string>; // Mapeo de canales lógicos a URLs de SQS
  client: SQSClient;
  logger?: any;
}

/**
 * Implementación de IMessagePublisher usando AWS SQS.
 * Esta clase encapsula toda la complejidad de interactuar con SQS.
 */
export class SQSMessagePublisher implements IMessagePublisher {
  private readonly client: SQSClient;
  private readonly queueUrlMap: Record<string, string>;
  // private readonly logger: Logger;

  constructor(config: SQSPublisherConfig) {
    this.client = config.client;
    this.queueUrlMap = config.queueUrlMap;
    // this.logger = config.logger || console;
  }

  async publish<T>(channel: string, message: T): Promise<string> {
    const queueUrl = this.getQueueUrl(channel);

    // Preparamos el mensaje con metadata útil
    const messageBody = this.serializeMessage(message);

    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: messageBody,
      // Agregamos atributos para facilitar filtrado y debugging
      MessageAttributes: {
        channel: {
          DataType: "String",
          StringValue: channel,
        },
        timestamp: {
          DataType: "String",
          StringValue: new Date().toISOString(),
        },
      },
    });

    try {
      const response = await this.client.send(command);

      console.log("Message published successfully", {
        channel,
        messageId: response.MessageId,
      });

      return response.MessageId!;
    } catch (error) {
      console.error("Failed to publish message", {
        channel,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Re-lanzamos el error para que el caller pueda manejarlo
      throw new MessagePublishError(
        `Failed to publish message to channel ${channel}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async publishBatch<T>(channel: string, messages: T[]): Promise<string[]> {
    const queueUrl = this.getQueueUrl(channel);

    // SQS tiene límite de 10 mensajes por batch, así que chunkeamos
    const chunks = this.chunkArray(messages, 10);
    const messageIds: string[] = [];

    for (const chunk of chunks) {
      const entries = chunk.map((message, index) => ({
        Id: `msg-${Date.now()}-${index}`, // ID único para cada mensaje en el batch
        MessageBody: this.serializeMessage(message),
        MessageAttributes: {
          channel: {
            DataType: "String",
            StringValue: channel,
          },
          timestamp: {
            DataType: "String",
            StringValue: new Date().toISOString(),
          },
        },
      }));

      const command = new SendMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: entries,
      });

      try {
        const response = await this.client.send(command);

        // Verificamos si hubo fallos parciales
        if (response.Failed && response.Failed.length > 0) {
          console.log("Some messages failed to publish", {
            channel,
            failedCount: response.Failed.length,
            failures: response.Failed,
          });

          console.log("Some messages failed to publish", {
            channel,
            failedCount: response.Failed.length,
            failures: response.Failed,
          });
        }

        // Recolectamos los IDs de mensajes exitosos
        if (response.Successful) {
          messageIds.push(...response.Successful.map((s) => s.MessageId!));
        }
      } catch (error) {
        console.error("Failed to publish batch", {
          channel,
          batchSize: chunk.length,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        throw new MessagePublishError(
          `Failed to publish batch to channel ${channel}`,
          error instanceof Error ? error : undefined,
        );
      }
    }

    return messageIds;
  }

  /**
   * Obtiene la URL de la cola SQS para un canal lógico
   */
  private getQueueUrl(channel: string): string {
    const queueUrl = this.queueUrlMap[channel];

    if (!queueUrl) {
      throw new Error(
        `No queue URL configured for channel: ${channel}. ` +
          `Available channels: ${Object.keys(this.queueUrlMap).join(", ")}`,
      );
    }

    return queueUrl;
  }

  /**
   * Serializa el mensaje a JSON con validación
   */
  private serializeMessage<T>(message: T): string {
    try {
      return JSON.stringify({
        data: message,
        metadata: {
          publishedAt: new Date().toISOString(),
          version: "1.0", // Útil para versionado de mensajes
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to serialize message: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Divide un array en chunks de tamaño específico
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

/**
 * Error específico para fallos de publicación de mensajes
 */
export class MessagePublishError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "MessagePublishError";
  }
}
