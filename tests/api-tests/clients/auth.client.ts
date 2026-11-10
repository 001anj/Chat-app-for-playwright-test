import type { APIRequestContext, APIResponse } from "@playwright/test";

export class AuthClient {
  constructor(private readonly request: APIRequestContext) {}

  signIn(username: string, password: string): Promise<APIResponse> {
    return this.request.post("/auth/sign-in", { data: { username, password } });
  }

  me(accessToken: string): Promise<APIResponse> {
    return this.request.get("/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  allUsers(accessToken: string): Promise<APIResponse> {
    return this.request.get("/auth/users", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}
