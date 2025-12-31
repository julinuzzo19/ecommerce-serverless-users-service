export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  avatar: string;
}

export type CreateUserData = Omit<User, "id">;
export type UpdateUserData = Partial<Omit<User, "id">>;
