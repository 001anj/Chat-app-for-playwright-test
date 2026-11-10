import { test, expect } from "../../../fixtures/auth.fixture";
import { expectErrorMessage } from "../../../helpers/api-error.helper";
import { expectMatchesSchema } from "../../../helpers/schema.helper";
import { feedbackRecordSchema } from "../../schemas/feedback.schema";
import { buildFeedbackPayload } from "../../../test-data/feedback.factory";
import { httpStatusCodes } from "../../../test-data/http-status-codes.data";
import { seededUsers } from "../../../test-data/users.data";

test.describe("POST /feedback - positive", () => {
  test("Admin successfully creates feedback for jane with a valid payload", async ({
    feedbackClient,
    authToken,
    authorId,
    receiverId,
    receiverUsername,
  }) => {
    const payload = buildFeedbackPayload(receiverId);

    const response = await test.step(`When admin submits feedback to ${receiverUsername}`, async () => {
      return feedbackClient.create(authToken, payload);
    });

    await test.step(`Then the feedback is created with admin as author and ${receiverUsername} as receiver`, async () => {
      expect(response.status()).toBe(httpStatusCodes.ok);

      const body = await response.json();
      expectMatchesSchema(body, feedbackRecordSchema);
      expect(body).toMatchObject({
        title: payload.title,
        body: payload.body,
        author: { id: authorId, username: seededUsers.admin.username },
        receiver: { id: receiverId, username: receiverUsername },
      });
    });
  });

  test("Admin creates feedback for jane when the title is exactly at the minimum length", async ({
    feedbackClient,
    authToken,
    receiverId,
    receiverUsername,
  }) => {
    const payload = { ...buildFeedbackPayload(receiverId), title: "abc" };

    const response = await test.step(`When admin submits feedback to ${receiverUsername} with a 3 character title`, async () => {
      return feedbackClient.create(authToken, payload);
    });

    await test.step("Then the feedback is created", async () => {
      expect(response.status()).toBe(httpStatusCodes.ok);

      const body = await response.json();
      expectMatchesSchema(body, feedbackRecordSchema);
    });
  });
});

test.describe("Negative tests for POST /feedback", () => {
  test("Rejects feedback for jane submitted with no authorization header", async ({ feedbackClient, receiverId, receiverUsername }) => {
    const payload = buildFeedbackPayload(receiverId);

    const response = await test.step(`When submitting feedback to ${receiverUsername} with no authorization header`, async () => {
      return feedbackClient.create(undefined, payload);
    });

    await test.step("Then the request is rejected as unauthorized", async () => {
      expect(response.status()).toBe(httpStatusCodes.unauthorized);
      await expectErrorMessage(response, "authorization");
    });
  });

  test("Rejects feedback for jane submitted with an invalid token", async ({ feedbackClient, receiverId, receiverUsername }) => {
    const payload = buildFeedbackPayload(receiverId);

    const response = await test.step(`When submitting feedback to ${receiverUsername} with a malformed token`, async () => {
      return feedbackClient.create("this-is-not-a-valid-jwt", payload);
    });

    await test.step("Then the request is rejected as unauthorized", async () => {
      expect(response.status()).toBe(httpStatusCodes.unauthorized);
      await expectErrorMessage(response);
    });
  });

  test("Rejects feedback from admin to jane with a missing title", async ({ feedbackClient, authToken, receiverId, receiverUsername }) => {
    const { title: _title, ...payload } = buildFeedbackPayload(receiverId);

    const response = await test.step(`When admin submits feedback to ${receiverUsername} with no title`, async () => {
      return feedbackClient.create(authToken, payload);
    });

    await test.step("Then the request is rejected as a bad request", async () => {
      expect(response.status()).toBe(httpStatusCodes.badRequest);
      await expectErrorMessage(response);
    });
  });

  test("Rejects feedback from admin to jane with a title below the minimum length", async ({
    feedbackClient,
    authToken,
    receiverId,
    receiverUsername,
  }) => {
    const payload = { ...buildFeedbackPayload(receiverId), title: "ab" };

    const response = await test.step(`When admin submits feedback to ${receiverUsername} with a 2 character title`, async () => {
      return feedbackClient.create(authToken, payload);
    });

    await test.step("Then the request is rejected as a bad request", async () => {
      expect(response.status()).toBe(httpStatusCodes.badRequest);
      await expectErrorMessage(response);
    });
  });

  test("Rejects feedback from admin to jane with a missing comment", async ({ feedbackClient, authToken, receiverId, receiverUsername }) => {
    const { body: _body, ...payload } = buildFeedbackPayload(receiverId);

    const response = await test.step(`When admin submits feedback to ${receiverUsername} with no comment`, async () => {
      return feedbackClient.create(authToken, payload);
    });

    await test.step("Then the request is rejected as a bad request", async () => {
      expect(response.status()).toBe(httpStatusCodes.badRequest);
      await expectErrorMessage(response);
    });
  });

  test("Rejects feedback from admin to jane with a comment below the minimum length", async ({
    feedbackClient,
    authToken,
    receiverId,
    receiverUsername,
  }) => {
    const payload = { ...buildFeedbackPayload(receiverId), body: "ab" };

    const response = await test.step(`When admin submits feedback to ${receiverUsername} with a 2 character comment`, async () => {
      return feedbackClient.create(authToken, payload);
    });

    await test.step("Then the request is rejected as a bad request", async () => {
      expect(response.status()).toBe(httpStatusCodes.badRequest);
      await expectErrorMessage(response);
    });
  });

  test("Rejects feedback from admin with a missing receiverId", async ({ feedbackClient, authToken, receiverId }) => {
    const { receiverId: _receiverId, ...payload } = buildFeedbackPayload(receiverId);

    const response = await test.step("When admin submits feedback with no receiverId", async () => {
      return feedbackClient.create(authToken, payload);
    });

    await test.step("Then the request is rejected as a bad request", async () => {
      expect(response.status()).toBe(httpStatusCodes.badRequest);
      await expectErrorMessage(response);
    });
  });

  test("Rejects feedback from admin with a non-numeric receiverId", async ({ feedbackClient, authToken, receiverId }) => {
    const payload = { ...buildFeedbackPayload(receiverId), receiverId: "not-a-number" };

    const response = await test.step("When admin submits feedback with a non-numeric receiverId", async () => {
      return feedbackClient.create(authToken, payload);
    });

    await test.step("Then the request is rejected as a bad request", async () => {
      expect(response.status()).toBe(httpStatusCodes.badRequest);
      await expectErrorMessage(response);
    });
  });

  test("Rejects feedback from admin for a receiver that does not exist", async ({ feedbackClient, authToken, receiverId }) => {
    const payload = { ...buildFeedbackPayload(receiverId), receiverId: 999_999 };

    const response = await test.step("When admin submits feedback for a non-existent receiver", async () => {
      return feedbackClient.create(authToken, payload);
    });

    await test.step("Then the request is rejected as not found", async () => {
      expect(response.status()).toBe(httpStatusCodes.notFound);
      await expectErrorMessage(response);
    });
  });

  test("Rejects feedback from admin to admin when receiverId matches the sender's own id", async ({
    feedbackClient,
    authToken,
    authorId,
  }) => {
    // Known defect (see tests/api-tests/API_TEST_CASES.md #1): the API accepts self-feedback (200)
    // instead of rejecting it, so this assertion fails against current behavior.
    test.fail();

    const payload = buildFeedbackPayload(authorId);

    const response = await test.step("When admin submits feedback with their own id as the receiverId", async () => {
      return feedbackClient.create(authToken, payload);
    });

    await test.step("Then the request is rejected as a bad request", async () => {
      expect(response.status()).toBe(httpStatusCodes.badRequest);
      await expectErrorMessage(response);
    });
  });

  test("Rejects feedback from admin to jane with a non-string title", async ({ feedbackClient, authToken, receiverId, receiverUsername }) => {
    const payload = { ...buildFeedbackPayload(receiverId), title: 12345 };

    const response = await test.step(`When admin submits feedback to ${receiverUsername} with a numeric title`, async () => {
      return feedbackClient.create(authToken, payload);
    });

    await test.step("Then the request is rejected as a bad request", async () => {
      expect(response.status()).toBe(httpStatusCodes.badRequest);
      await expectErrorMessage(response);
    });
  });

  test("Rejects feedback from admin to jane with a non-string comment", async ({ feedbackClient, authToken, receiverId, receiverUsername }) => {
    const payload = { ...buildFeedbackPayload(receiverId), body: 12345 };

    const response = await test.step(`When admin submits feedback to ${receiverUsername} with a numeric comment`, async () => {
      return feedbackClient.create(authToken, payload);
    });

    await test.step("Then the request is rejected as a bad request", async () => {
      expect(response.status()).toBe(httpStatusCodes.badRequest);
      await expectErrorMessage(response);
    });
  });

  test("Rejects feedback from admin to jane with a comment above the maximum length", async ({
    feedbackClient,
    authToken,
    receiverId,
    receiverUsername,
  }) => {
    const payload = { ...buildFeedbackPayload(receiverId), body: "a".repeat(10_001) };

    const response = await test.step(`When admin submits feedback to ${receiverUsername} with a 10001 character comment`, async () => {
      return feedbackClient.create(authToken, payload);
    });

    await test.step("Then the request is rejected as a bad request", async () => {
      expect(response.status()).toBe(httpStatusCodes.badRequest);
      await expectErrorMessage(response);
    });
  });

  test("Rejects feedback from admin with a boolean receiverId", async ({ feedbackClient, authToken, receiverId }) => {
    const payload = { ...buildFeedbackPayload(receiverId), receiverId: true };

    const response = await test.step("When admin submits feedback with a boolean receiverId", async () => {
      return feedbackClient.create(authToken, payload);
    });

    await test.step("Then the request is rejected as a bad request", async () => {
      expect(response.status()).toBe(httpStatusCodes.badRequest);
      await expectErrorMessage(response);
    });
  });

  test("Rejects feedback from admin with a decimal receiverId", async ({ feedbackClient, authToken, receiverId }) => {
    const payload = { ...buildFeedbackPayload(receiverId), receiverId: 1.5 };

    const response = await test.step("When admin submits feedback with a decimal receiverId", async () => {
      return feedbackClient.create(authToken, payload);
    });

    await test.step("Then the request is rejected as a bad request", async () => {
      expect(response.status()).toBe(httpStatusCodes.badRequest);
      await expectErrorMessage(response);
    });
  });
});
