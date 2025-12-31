import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

// Tipo para tus handlers
export type LambdaHandler = (
  event: APIGatewayProxyEvent
) => Promise<APIGatewayProxyResult>;

// Tipos de respuesta
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Usuario autenticado
export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

// Extender el event para incluir user
export interface AuthenticatedEvent extends APIGatewayProxyEvent {
  user?: AuthUser;
}
