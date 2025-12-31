import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Cliente singleton (reutilizable entre invocaciones)
let docClient: DynamoDBDocumentClient | null = null;

export const getDynamoDBClient = (): DynamoDBDocumentClient => {
  if (!docClient) {
    console.log('🔌 Creando cliente DynamoDB');

    const client = new DynamoDBClient({
      region: process.env.REGION || 'us-east-1',
      // Para testing local con DynamoDB local
      ...(process.env.DYNAMODB_ENDPOINT && {
        endpoint: process.env.DYNAMODB_ENDPOINT,
      }),
    });

    docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        // Convertir undefined a null
        convertEmptyValues: false,
        // Remover valores undefined
        removeUndefinedValues: true,
        // Convertir class instances a maps
        convertClassInstanceToMap: false,
      },
      unmarshallOptions: {
        // Convertir números a native JS numbers
        wrapNumbers: false,
      },
    });
  }

  return docClient;
};