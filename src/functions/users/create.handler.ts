import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { usersService } from "../../services/users.service";
import { validateDto } from "../../shared/utils/validator";
import { CreateUserDto } from "../../dtos/create-user.dto";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  //   const queryParams = event.queryStringParameters;
  //   const pathParams = event.pathParameters;
  //   const headers = event.headers;

  const body = event.body ? JSON.parse(event.body) : null;

  const validatedBody = await validateDto(CreateUserDto, body);

  const userId = await usersService.createUser(validatedBody);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "User created successfully", userId }),
  };
};
