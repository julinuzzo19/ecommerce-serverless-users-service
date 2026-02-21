import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { container } from "../../infrastructure/di/container";
import { validateDto } from "../../shared/utils/validator";
import { UpdateUserDto } from "../../dtos/update-user.dto";

const usersService = container.usersService;

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
