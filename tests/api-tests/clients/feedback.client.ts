import type { APIRequestContext, APIResponse } from "@playwright/test";

export type FeedbackCreatePayload = {
  title: string;
  body: string;
  receiverId: number;
};

export class FeedbackClient {
  constructor(private readonly request: APIRequestContext) {}

  create(accessToken: string | undefined, payload: Partial<Record<keyof FeedbackCreatePayload, unknown>>): Promise<APIResponse> {
    return this.request.post("/feedback", {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      data: payload,
    });
  }

  all(accessToken: string | undefined): Promise<APIResponse> {
    return this.request.get("/feedback", {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
  }
}
