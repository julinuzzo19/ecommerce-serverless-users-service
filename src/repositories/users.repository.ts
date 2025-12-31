import {
  GetCommand,
  PutCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { BaseRepository } from "./base.repository";
import { v4 as uuidv4 } from "uuid";
import { Indexes, Tables } from "../shared/constants/tables";
import { CreateUserData, UpdateUserData, User } from "../models/user.model";

export class UsersRepository extends BaseRepository {
  constructor() {
    super(Tables.USERS);
  }

  async create(data: CreateUserData): Promise<User> {
    const user: User = {
      id: uuidv4(),
      ...data,
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: user,
      })
    );

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      })
    );

    return (result.Item as User) || null;
  }

  async findAll(): Promise<User[]> {
    const result = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
      })
    );

    return (result.Items as User[]) || [];
  }

  async findByEmail(email: string): Promise<User[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: Indexes.USERS_EMAIL,
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": email,
        },
      })
    );

    return (result.Items as User[]) || [];
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    // Construir UpdateExpression dinámicamente
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      updateExpressions.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = value;
    });

    const result = await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      })
    );

    return result.Attributes as User;
  }

  async delete(id: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id },
      })
    );
  }

  async exists(id: string): Promise<boolean> {
    const user = await this.findById(id);
    return user !== null;
  }
}
