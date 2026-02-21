import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { container } from "../../infrastructure/di/container";

const usersService = container.usersService;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const params = event.pathParameters;

  if (!params?.id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "User ID is required in path parameters",
      }),
    };
  }

  await usersService.deleteUser(params.id);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "User deleted successfully",
      userId: params.id,
    }),
  };
};
