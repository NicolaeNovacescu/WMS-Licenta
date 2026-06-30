export type AppRole = "Sales" | "Warehouse" | "Admin";

export type CurrentUser = {
  id: string;
  userName: string;
  roles: string[];
};

export type AppSession = {
  user: CurrentUser;
};

export type AuthResponse = {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
  user: CurrentUser;
};

export type LoginCredentials = {
  userName: string;
  password: string;
};

export type LoginFormState = {
  error: string | null;
};
