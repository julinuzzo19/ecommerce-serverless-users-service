import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { usersService } from "../../services/users.service";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const users = await usersService.findAll();

  return {
    statusCode: 200,
    body: JSON.stringify(users),
  };
};
