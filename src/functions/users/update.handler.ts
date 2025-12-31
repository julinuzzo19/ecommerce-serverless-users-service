import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { usersService } from "../../services/users.service";
import { validateDto } from "../../shared/utils/validator";
import { CreateUserDto } from "../../dtos/create-user.dto";
import { UpdateUserDto } from "../../dtos/update-user.dto";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const userId = event.pathParameters?.id;

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "User ID is required in path parameters",
      }),
    };
  }

  const body = event.body ? JSON.parse(event.body) : null;

  const validatedBody = await validateDto(UpdateUserDto, body);

  const updatedUserId = await usersService.updateUser(userId, validatedBody);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "User updated successfully",
      userId: updatedUserId,
    }),
  };
};
