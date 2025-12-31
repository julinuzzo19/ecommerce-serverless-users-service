import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { usersService } from "../../services/users.service";
import { validateDto } from "../../shared/utils/validator";
import { CreateUserDto } from "../../dtos/create-user.dto";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const pathParams = event.pathParameters;

  if (!pathParams?.id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "User ID is required in path parameters",
      }),
    };
  }

  const user = await usersService.findById(pathParams.id);

  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
};
