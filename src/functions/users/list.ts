import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { container } from "../../infrastructure/di/container";

const usersService = container.usersService;

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const users = await usersService.findAll();

  return {
    statusCode: 200,
    body: JSON.stringify(users),
  };
};
