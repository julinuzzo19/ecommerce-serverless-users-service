import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { container } from "../../infrastructure/di/container";

const usersService = container.usersService;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const queryParams = event.queryStringParameters;

  if (!queryParams?.email) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Email query parameter is required",
      }),
    };
  }

  const user = await usersService.findByEmail(queryParams.email);

  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
};
