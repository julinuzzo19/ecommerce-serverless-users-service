import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getDynamoDBClient } from "../shared/database/dynamodb.client";

export abstract class BaseRepository {
  protected docClient: DynamoDBDocumentClient;
  protected tableName: string;

  constructor(tableName: string) {
    this.docClient = getDynamoDBClient();
    this.tableName = tableName;
  }
}
