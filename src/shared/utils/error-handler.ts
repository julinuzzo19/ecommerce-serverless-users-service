import { serverError, badRequest } from "./response";
import { APIGatewayProxyResult } from "aws-lambda";

export const handleError = (error: any): APIGatewayProxyResult => {
  console.error("Error:", error);

  // Errores de validación (Zod)
  if (error.name === "ZodError") {
    return badRequest(error.errors.map((e: any) => e.message).join(", "));
  }

  // Errores personalizados
  if (error.statusCode) {
    return {
      statusCode: error.statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }

  // Error genérico
  return serverError(error.message || "Internal server error");
};
