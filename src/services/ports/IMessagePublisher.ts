/**
 * Puerto de salida para publicar mensajes.
 * Esta abstracción permite que la lógica de negocio publique eventos
 * sin conocer el mecanismo de transporte específico (SQS, RabbitMQ, etc.)
 */
export interface IMessagePublisher {
  /**
   * Publica un mensaje en un canal específico
   * @param channel - El nombre del canal/cola/topic donde publicar
   * @param message - El payload del mensaje, debe ser serializable
   * @returns El ID del mensaje publicado
   */
  publish<T>(channel: string, message: T): Promise<string>;

  /**
   * Publica múltiples mensajes en batch para eficiencia
   * @param channel - El nombre del canal donde publicar
   * @param messages - Array de mensajes a publicar
   * @returns Array de IDs de mensajes publicados
   */
  publishBatch<T>(channel: string, messages: T[]): Promise<string[]>;
}
