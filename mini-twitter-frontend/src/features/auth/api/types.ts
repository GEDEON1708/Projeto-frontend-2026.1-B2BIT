export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};
