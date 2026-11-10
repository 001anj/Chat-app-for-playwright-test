import { test as base, request, expect, type APIRequestContext, type APIResponse, type Page } from "@playwright/test";

import { AuthClient } from "../api-tests/clients/auth.client";
import { FeedbackClient, type FeedbackCreatePayload } from "../api-tests/clients/feedback.client";
import { setAccessToken } from "../helpers/storage.helper";
import { deleteFeedback } from "../helpers/db.helper";
import { seededUsers, type SeededUsername } from "../test-data/users.data";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3022";
const DEFAULT_USER: SeededUsername = "admin";

/**
 * Tracks every feedback id created through `.create()` so the fixture can
 * delete exactly those rows in teardown, right after `use()`. Covers every
 * API-driven creation path: `createdFeedback` and any inline
 * `feedbackClient.create(...)` call in a spec file.
 */
class FeedbackCreationTracker extends FeedbackClient {
  readonly createdFeedbackIds: number[] = [];

  async create(
    accessToken: string | undefined,
    payload: Partial<Record<keyof FeedbackCreatePayload, unknown>>,
  ): Promise<APIResponse> {
    const response = await super.create(accessToken, payload);

    if (response.ok()) {
      const body = await response.json();
      if (typeof body?.id === "number") {
        this.createdFeedbackIds.push(body.id);
      }
    }

    return response;
  }
}

type TokenForUser = (username: string, password: string) => Promise<string>;

type AuthFixtures = {
  apiRequestContext: APIRequestContext;
  authClient: AuthClient;
  feedbackClient: FeedbackClient;
  tokenForUser: TokenForUser;
  authToken: string;
  users: { id: number; username: string }[];
  author: { id: number; username: string };
  authorId: number;
  receiver: { id: number; username: string };
  receiverId: number;
  receiverUsername: string;
  loggedInPage: Page;
};

export const test = base.extend<AuthFixtures>({
  apiRequestContext: async ({}, use) => {
    const context = await request.newContext({ baseURL: API_BASE_URL });
    await use(context);
    await context.dispose();
  },

  authClient: async ({ apiRequestContext }, use) => {
    await use(new AuthClient(apiRequestContext));
  },

  feedbackClient: async ({ apiRequestContext }, use) => {
    const client = new FeedbackCreationTracker(apiRequestContext);
    await use(client);
    await deleteFeedback(client.createdFeedbackIds);
  },

  tokenForUser: async ({ authClient }, use) => {
    await use(async (username: string, password: string) => {
      const response = await authClient.signIn(username, password);
      expect(response.ok(), `sign-in failed for "${username}": ${response.status()} ${await response.text()}`).toBeTruthy();

      const { accessToken } = await response.json();
      return accessToken;
    });
  },

  authToken: async ({ tokenForUser }, use) => {
    const accessToken = await tokenForUser(seededUsers[DEFAULT_USER].username, seededUsers[DEFAULT_USER].password);
    await use(accessToken);
  },

  users: async ({ authClient, authToken }, use) => {
    const response = await authClient.allUsers(authToken);
    expect(response.ok(), `users fixture setup failed: ${response.status()}`).toBeTruthy();

    const users: { id: number; username: string }[] = await response.json();
    await use(users);
  },

  author: async ({ users }, use) => {
    const author = users.find((user) => user.username === seededUsers[DEFAULT_USER].username);
    expect(author, "author fixture setup failed: signed-in user not found in users list").toBeTruthy();

    await use(author!);
  },

  authorId: async ({ author }, use) => {
    await use(author.id);
  },

  receiver: async ({ users }, use) => {
    const receiver = users.find((user) => user.username !== seededUsers[DEFAULT_USER].username);
    expect(receiver, "receiver fixture setup failed: no other seeded user found").toBeTruthy();

    await use(receiver!);
  },

  receiverId: async ({ receiver }, use) => {
    await use(receiver.id);
  },

  receiverUsername: async ({ receiver }, use) => {
    await use(receiver.username);
  },

  loggedInPage: async ({ page, authToken }, use) => {
    await setAccessToken(page, authToken);
    await page.goto("/feedback");
    await use(page);
  },

  // Tracks feedback created directly through the UI (e.g. the create-feedback
  // dialog), which bypasses `feedbackClient` entirely, so it gets the same
  // per-test cleanup as API-driven creation.
  page: async ({ page }, use) => {
    const createdFeedbackIds: number[] = [];

    page.on("response", async (response) => {
      if (response.request().method() !== "POST" || !response.url().endsWith("/feedback") || !response.ok()) {
        return;
      }

      try {
        const body = await response.json();
        if (typeof body?.id === "number") {
          createdFeedbackIds.push(body.id);
        }
      } catch {
        // non-JSON response, nothing to track
      }
    });

    await use(page);
    await deleteFeedback(createdFeedbackIds);
  },
});

export { expect } from "@playwright/test";
