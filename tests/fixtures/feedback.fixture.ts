import { test as base, expect } from "./auth.fixture";
import { buildFeedbackPayload } from "../test-data/feedback.factory";

export type FeedbackRecord = {
  id: number;
  title: string;
  body: string;
  author: { id: number; username: string };
  receiver: { id: number; username: string };
};

type FeedbackFixtures = {
  createdFeedback: FeedbackRecord;
};

export const test = base.extend<FeedbackFixtures>({
  createdFeedback: async ({ feedbackClient, authToken, receiverId }, use) => {
    const payload = buildFeedbackPayload(receiverId);

    const response = await feedbackClient.create(authToken, payload);
    expect(response.ok(), `createdFeedback fixture setup failed: ${response.status()}`).toBeTruthy();

    const body: FeedbackRecord = await response.json();
    await use(body);
  },
});

export { expect } from "@playwright/test";
