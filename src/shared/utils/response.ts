import { APIGatewayProxyResult } from "aws-lambda";
import { ApiResponse } from "../types";

export const createResponse = (
  statusCode: number,
  body: ApiResponse,
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // CORS
      "Access-Control-Allow-Credentials": true,
      ...headers,
    },
    body: JSON.stringify(body),
  };
};

export const success = <T>(
  data: T,
  message?: string
): APIGatewayProxyResult => {
  return createResponse(200, {
    success: true,
    data,
    message,
  });
};

export const created = <T>(
  data: T,
  message?: string
): APIGatewayProxyResult => {
  return createResponse(201, {
    success: true,
    data,
    message,
  });
};

export const badRequest = (error: string): APIGatewayProxyResult => {
  return createResponse(400, {
    success: false,
    error,
  });
};

export const unauthorized = (
  error: string = "Unauthorized"
): APIGatewayProxyResult => {
  return createResponse(401, {
    success: false,
    error,
  });
};

export const notFound = (
  error: string = "Not found"
): APIGatewayProxyResult => {
  return createResponse(404, {
    success: false,
    error,
  });
};

export const serverError = (
  error: string = "Internal server error"
): APIGatewayProxyResult => {
  return createResponse(500, {
    success: false,
    error,
  });
};
