const {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} = require("@aws-sdk/client-dynamodb");

const region = process.env.REGION || process.env.AWS_REGION || "us-east-1";
const endpoint = process.env.DYNAMODB_ENDPOINT || "http://localhost:8000";
const tableName = process.env.USERS_TABLE || "users-service-db";

const clientConfig = {
  region,
  ...(endpoint ? { endpoint } : {}),
  ...(endpoint
    ? {
        // DynamoDB Local no valida credenciales, pero el SDK igual necesita alguna.
        credentials: { accessKeyId: "local", secretAccessKey: "local" },
      }
    : {}),
};

const dynamodb = new DynamoDBClient(clientConfig);

async function tableExists(name) {
  try {
    await dynamodb.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch (err) {
    if (err && (err.name === "ResourceNotFoundException" || err.$metadata?.httpStatusCode === 400)) {
      return false;
    }
    throw err;
  }
}

async function main() {
  if (await tableExists(tableName)) {
    console.log(`✅ Tabla '${tableName}' ya existe en ${endpoint}`);
    return;
  }

  console.log(`🛠️  Creando tabla '${tableName}' en ${endpoint}...`);

  await dynamodb.send(
    new CreateTableCommand({
      TableName: tableName,
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" },
        { AttributeName: "email", AttributeType: "S" },
      ],
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
      GlobalSecondaryIndexes: [
        {
          IndexName: "EmailIndex",
          KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
          Projection: { ProjectionType: "ALL" },
        },
      ],
    })
  );

  console.log("✅ Tabla creada");
}

main().catch((err) => {
  console.error("❌ Error creando tabla:", err);
  process.exit(1);
});
