/**
 * Esta implementación simple de un container de dependencias me ofrece flexibilidad y control sobre la creación y gestión de instancias.
 * Permitiendo importar dependencias de manera individual según se necesiten.
 *
 * Tambien es util para testing, ya que puedo reemplazar dependencias con mocks fácilmente, usando el método `set`.
 *
 * # Tradeoffs vs usar un framework de DI completo:
 *
 * - Pros:
 *   - Muy simple y liviano, sin dependencias adicionales. IMPORTANTE EN LAMBDA, donde el cold start importa.
 *
 * - Contras:
 *   - No tiene features avanzadas como inyección automática, scopes, etc.
 *   - Requiere más boilerplate para definir getters para cada dependencia.
 *
 */

import { SQSClient } from "@aws-sdk/client-sqs";
import {
  createSQSClient,
  getQueueUrlMap,
} from "../messaging/config/sqs-client";
import { IMessagePublisher } from "../../services/ports/IMessagePublisher";
import { SQSMessagePublisher } from "../messaging/SQSMessagePublisher";
import { UsersRepository } from "../../repositories/users.repository";

class Container {
  private instances: Map<string, any> = new Map();

  /**
   * Cliente SQS compartido por todos los servicios de mensajería.
   * Esto es importante porque el cliente SQS mantiene connection pooling interno.
   */
  getSQSClient(): SQSClient {
    const key = "sqsClient";

    if (!this.instances.has(key)) {
      // La primera vez que se pide, creamos el cliente
      console.log("Creating SQS client instance (cold start)");
      this.instances.set(key, createSQSClient());
    }

    // En invocaciones subsecuentes (warm starts), retornamos la instancia existente
    return this.instances.get(key);
  }

  /**
   * Message Publisher singleton.
   * Depende del SQS client, que también obtenemos como singleton.
   */
  getMessagePublisher(): IMessagePublisher {
    const key = "messagePublisher";

    if (!this.instances.has(key)) {
      console.log("Creating MessagePublisher instance");

      this.instances.set(
        key,
        new SQSMessagePublisher({
          client: this.getSQSClient(), // Reutilizamos el cliente singleton
          queueUrlMap: getQueueUrlMap(),
        }),
      );
    }

    return this.instances.get(key);
  }

  /**
   * Repository de órdenes.
   * En un sistema real, esto también tendría un connection pool de base de datos
   * que querríamos reutilizar entre invocaciones.
   */
  getUserRepository() {
    const key = "userRepository";

    if (!this.instances.has(key)) {
      console.log("Creating UserRepository instance");
      this.instances.set(key, new UsersRepository());
    }

    return this.instances.get(key);
  }

  getCreateOrderUseCase(): CreateOrderUseCase {
    const key = "createOrderUseCase";

    if (!this.instances.has(key)) {
      console.log("Creating CreateOrderUseCase instance");

      // Inyectamos las dependencias que el caso de uso necesita
      this.instances.set(
        key,
        new CreateOrderUseCase(
          this.getOrderRepository(), // Singleton compartido
          this.getMessagePublisher(), // Singleton compartido
          console, // Logger simple, podría ser un singleton también
        ),
      );
    }

    return this.instances.get(key);
  }

  /**
   * Método útil para testing: permite reemplazar una dependencia con un mock.
   * En producción nunca se usa, pero en tests es invaluable.
   */
  set<T>(key: string, instance: T): void {
    this.instances.set(key, instance);
  }

  /**
   * Método para limpiar todas las instancias.
   * Útil principalmente en testing para tener un estado limpio entre tests.
   */
  clear(): void {
    this.instances.clear();
  }

  /**
   * Message Consumer singleton.
   * También depende del mismo cliente SQS.
   */
  //   getMessageConsumer(): IMessageConsumer {
  //     const key = "messageConsumer";

  //     if (!this.instances.has(key)) {
  //       console.log("Creating MessageConsumer instance");

  //       this.instances.set(
  //         key,
  //         new SQSMessageConsumer({
  //           client: this.getSQSClient(), // Mismo cliente reutilizado
  //           queueUrlMap: getQueueUrlMap(),
  //         }),
  //       );
  //     }

  //     return this.instances.get(key);
  //   }
}

// Creamos una única instancia del container y la exportamos
// Esta instancia del container es el singleton, no las dependencias individuales
const container = new Container();

// Exportamos funciones helper que internamente usan el container
// Esto hace que el código sea más limpio en los puntos de uso
export const getMessagePublisher = () => container.getMessagePublisher();
// export const getMessageConsumer = () => container.getMessageConsumer();
export const getCreateOrderUseCase = () => container.getCreateOrderUseCase();
export const getOrderRepository = () => container.getOrderRepository();

// También exportamos el container para casos avanzados o testing
export { container };
