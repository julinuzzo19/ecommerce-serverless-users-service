import { SQSClient } from "@aws-sdk/client-sqs";
import { UsersRepository } from "../../repositories/users.repository";
import { UsersService } from "../../services/users.service";
import { IMessagePublisher } from "../../services/ports/IMessagePublisher";
import { SQSMessagePublisher } from "../messaging/SQSMessagePublisher";
import {
  createSQSClient,
  getQueueUrlMap,
} from "../messaging/config/sqs-client";

class Container {
  private readonly instances = new Map<string, unknown>();

  private getOrCreate<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory());
    }

    return this.instances.get(key) as T;
  }

  getSQSClient(): SQSClient {
    return this.getOrCreate("sqsClient", () => createSQSClient());
  }

  getMessagePublisher(): IMessagePublisher {
    return this.getOrCreate(
      "messagePublisher",
      () =>
        new SQSMessagePublisher({
          client: this.getSQSClient(),
          queueUrlMap: getQueueUrlMap(),
        }),
    );
  }

  getUsersRepository(): UsersRepository {
    return this.getOrCreate("usersRepository", () => new UsersRepository());
  }

  getUsersService(): UsersService {
    return this.getOrCreate(
      "usersService",
      () => new UsersService(this.getUsersRepository()),
    );
  }

  get usersRepository(): UsersRepository {
    return this.getUsersRepository();
  }

  get usersService(): UsersService {
    return this.getUsersService();
  }

  set<T>(key: string, instance: T): void {
    this.instances.set(key, instance);
  }

  clear(): void {
    this.instances.clear();
  }
}

export const container = new Container();
export const getUsersService = (): UsersService => container.getUsersService();
export const getUsersRepository = (): UsersRepository =>
  container.getUsersRepository();
export const getMessagePublisher = (): IMessagePublisher =>
  container.getMessagePublisher();
