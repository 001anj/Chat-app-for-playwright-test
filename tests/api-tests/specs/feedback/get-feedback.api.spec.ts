import { test, expect } from "../../../fixtures/feedback.fixture";
import { expectErrorMessage } from "../../../helpers/api-error.helper";
import { expectMatchesSchema } from "../../../helpers/schema.helper";
import { feedbackListSchema } from "../../schemas/feedback.schema";
import { httpStatusCodes } from "../../../test-data/http-status-codes.data";
import { buildFeedbackPayload } from "../../../test-data/feedback.factory";
import { seededUsers } from "../../../test-data/users.data";

test.describe("GET /feedback - positive", () => {
  test("Returns the feedback list including a feedback item created via the API", async ({
    feedbackClient,
    authToken,
    createdFeedback,
  }) => {
    const response = await test.step("When admin requests the feedback list", async () => {
      return feedbackClient.all(authToken);
    });

    await test.step("Then the list is returned and includes the feedback item admin created", async () => {
      expect(response.status()).toBe(httpStatusCodes.ok);

      const body = await response.json();
      expectMatchesSchema(body, feedbackListSchema);

      const createdItem = body.find((item: { id: number }) => item.id === createdFeedback.id);
      expect(createdItem).toEqual(createdFeedback);
    });
  });

  test("Shows feedback sent by admin to jane in jane's feedback list", async ({
    tokenForUser,
    feedbackClient,
    authToken,
    authorId,
    receiverId,
    receiverUsername,
  }) => {
    const payload = buildFeedbackPayload(receiverId);

    const createdFeedback = await test.step("Given admin sends feedback to jane", async () => {
      const response = await feedbackClient.create(authToken, payload);
      expect(response.status()).toBe(httpStatusCodes.ok);

      return response.json();
    });

    const janeToken = await test.step("When jane signs in", async () => {
      return tokenForUser(seededUsers.jane.username, seededUsers.jane.password);
    });

    await test.step("Then the feedback appears in jane's feedback list", async () => {
      const response = await feedbackClient.all(janeToken);
      expect(response.status()).toBe(httpStatusCodes.ok);

      const body = await response.json();
      expectMatchesSchema(body, feedbackListSchema);

      const receivedItem = body.find((item: { id: number }) => item.id === createdFeedback.id);
      expect(receivedItem).toEqual({
        ...createdFeedback,
        author: { id: authorId, username: seededUsers.admin.username },
        receiver: { id: receiverId, username: receiverUsername },
      });
    });
  });

  test("Shows feedback sent by jane to admin on admin's feedback wall", async ({
    tokenForUser,
    feedbackClient,
    authToken,
    users,
  }) => {
    const jane = users.find((user) => user.username === seededUsers.jane.username);
    const admin = users.find((user) => user.username === seededUsers.admin.username);
    expect(jane, 'seeded user "jane" not found').toBeTruthy();
    expect(admin, 'seeded user "admin" not found').toBeTruthy();

    const janeToken = await test.step("Given jane signs in", async () => {
      return tokenForUser(seededUsers.jane.username, seededUsers.jane.password);
    });

    const payload = buildFeedbackPayload(admin!.id);

    const createdFeedback = await test.step("And jane sends feedback to admin", async () => {
      const response = await feedbackClient.create(janeToken, payload);
      expect(response.status()).toBe(httpStatusCodes.ok);

      return response.json();
    });

    await test.step("Then the feedback appears on admin's feedback wall", async () => {
      const response = await feedbackClient.all(authToken);
      expect(response.status()).toBe(httpStatusCodes.ok);

      const body = await response.json();
      expectMatchesSchema(body, feedbackListSchema);

      const feedItem = body.find((item: { id: number }) => item.id === createdFeedback.id);
      expect(feedItem).toEqual({
        ...createdFeedback,
        title: payload.title,
        body: payload.body,
        author: { id: jane!.id, username: seededUsers.jane.username },
        receiver: { id: admin!.id, username: seededUsers.admin.username },
      });
    });
  });
});

test.describe("GET /feedback - negative", () => {
  test("Rejects the feedback list request when no authorization header is sent", async ({ feedbackClient }) => {
    const response = await test.step("When requesting the feedback list with no authorization header", async () => {
      return feedbackClient.all(undefined);
    });

    await test.step("Then the feedback list request is rejected as unauthorized", async () => {
      expect(response.status()).toBe(httpStatusCodes.unauthorized);
      await expectErrorMessage(response, "authorization");
    });
  });

  test("Rejects the feedback list request when the token is invalid", async ({ feedbackClient }) => {
    const response = await test.step("When requesting the feedback list with a malformed token", async () => {
      return feedbackClient.all("this-is-not-a-valid-jwt");
    });

    await test.step("Then the feedback list request is rejected as unauthorized", async () => {
      expect(response.status()).toBe(httpStatusCodes.unauthorized);
      await expectErrorMessage(response);
    });
  });
});
