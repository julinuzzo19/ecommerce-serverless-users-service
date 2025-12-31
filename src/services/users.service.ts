import { CreateUserDto } from "../dtos/create-user.dto";
import { CreateUserData, UpdateUserData, User } from "../models/user.model";
import { UsersRepository } from "../repositories/users.repository";

export interface UserByEmailResponseDto {
  userId: string;
  email: string;
  roles: Array<User["role"]>;
}

type HttpError = {
  statusCode: number;
  message: string;
  details?: unknown;
};

const httpError = (
  statusCode: number,
  message: string,
  details?: unknown
): HttpError => ({
  statusCode,
  message,
  ...(details !== undefined ? { details } : {}),
});

export class UsersService {
  private usersRepository: UsersRepository;
  constructor() {
    this.usersRepository = new UsersRepository();
  }

  async findById(id: string): Promise<User | null> {
    if (!id) return null;
    return await this.usersRepository.findById(id);
  }

  async findByEmail(email: string): Promise<UserByEmailResponseDto> {
    if (!email) {
      throw httpError(400, "Email is required");
    }

    const users = await this.usersRepository.findByEmail(email);
    const user = users[0];

    if (!user) {
      throw httpError(404, `User with email ${email} not found`);
    }

    return { userId: user.id, email: user.email, roles: [user.role] };
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.findAll();
  }

  async createUser(createUserDto: CreateUserDto): Promise<string> {
    try {
      const existing = await this.usersRepository.findByEmail(
        createUserDto.email
      );
      if (existing.length > 0) {
        throw httpError(
          409,
          `User with email ${createUserDto.email} already exists`
        );
      }

      const data: CreateUserData = {
        name: createUserDto.name,
        email: createUserDto.email,
        role: createUserDto.role,
        avatar: createUserDto.avatar ?? "",
      };

      const user = await this.usersRepository.create(data);

      // TODO: publicar evento "user.created" (SNS/SQS/EventBridge)
      return user.id;
    } catch (error) {
      if ((error as HttpError)?.statusCode) throw error;

      throw httpError(400, "Error creating user", {
        cause: error instanceof Error ? error.message : error,
      });
    }
  }

  async updateUser(
    userId: string,
    updateData: UpdateUserData
  ): Promise<string> {
    if (!userId) {
      throw httpError(400, "userId is required");
    }

    const existing = await this.usersRepository.findById(userId);
    if (!existing) {
      throw httpError(404, `User with id ${userId} not found`);
    }

    if (updateData.email && updateData.email !== existing.email) {
      const usersWithEmail = await this.usersRepository.findByEmail(
        updateData.email
      );
      const takenByOther = usersWithEmail.some((u) => u.id !== userId);
      if (takenByOther) {
        throw httpError(
          409,
          `User with email ${updateData.email} already exists`
        );
      }
    }

    try {
      return (await this.usersRepository.update(userId, updateData)).id;
    } catch (error) {
      throw httpError(400, "Error updating user", {
        cause: error instanceof Error ? error.message : error,
      });
    }
  }

  async deleteUser(userId: string): Promise<void> {
    if (!userId) {
      throw httpError(400, "userId is required");
    }

    const existing = await this.usersRepository.findById(userId);
    if (!existing) {
      throw httpError(404, `User with id ${userId} not found`);
    }

    try {
      await this.usersRepository.delete(userId);
    } catch (error) {
      throw httpError(400, "Error deleting user", {
        cause: error instanceof Error ? error.message : error,
      });
    }
  }
}

export const usersService = new UsersService();
