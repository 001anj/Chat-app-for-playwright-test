import { test, expect } from "../../../fixtures/pages.fixture";
import { buildFeedbackContent } from "../../../test-data/feedback.factory";
import { validationMessages } from "../../../test-data/validation-messages.data";
import { seededUsers } from "../../../test-data/users.data";
import { httpStatusCodes } from "../../../test-data/http-status-codes.data";
import { setAccessToken } from "../../../helpers/storage.helper";
import { FeedbackWallPage } from "../../pages/feedback-wall.page";

test.describe("Feedback wall test", () => {
  test.beforeEach(async ({ feedbackWallPage }) => {
    await test.step("Given admin opens the feedback wall", async () => {
      await feedbackWallPage.goto();
    });
  });

  test("Shows the seeded feedback from admin on admin's feedback wall", async ({ feedbackWallPage }) => {
    await test.step("Then the wall shows its heading and the seeded feedback from admin to jane", async () => {
      await expect(feedbackWallPage.heading).toBeVisible();

      await expect(
        feedbackWallPage.feedbackCardBetween(seededUsers.admin.username, seededUsers.jane.username),
      ).toBeVisible();
    });
  });

  test("Returns the feedback wall to its normal state after admin expands it to fullscreen and exits fullscreen", async ({
    feedbackWallPage,
  }) => {
    await test.step("Given the feedback wall is not in fullscreen", async () => {
      expect(await feedbackWallPage.isBrowserFullscreen()).toBe(false);
    });

    await test.step("When admin clicks the fullscreen toggle and the browser enters fullscreen", async () => {
      await feedbackWallPage.toggleFullscreen();
      await expect.poll(() => feedbackWallPage.isBrowserFullscreen()).toBe(true);
    });

    await test.step("When fullscreen is exited and the browser leaves fullscreen", async () => {
      await feedbackWallPage.exitFullscreenProgrammatically();
      await expect.poll(() => feedbackWallPage.isBrowserFullscreen()).toBe(false);
    });
  });
});

test.describe("E2E feedback form tests", () => {
  test.beforeEach(async ({ feedbackWallPage }) => {
    await test.step("Given the create feedback dialog is open", async () => {
      await feedbackWallPage.openCreateForm();
    });
  });

  test("Adds the new feedback to the wall after a valid submission", async ({ feedbackWallPage, createFormPage }) => {
    const { title, body } = buildFeedbackContent();

    await test.step("When submitting feedback from admin to jane", async () => {
      await createFormPage.submit({ title, body, receiverUsername: seededUsers.jane.username });
    });

    await test.step("Then the new feedback appears on the wall showing admin as author and jane as receiver", async () => {
      await expect(feedbackWallPage.feedbackCard(title)).toBeVisible();
      await expect(feedbackWallPage.feedbackCardHeading(title)).toHaveText(title);
      await expect(feedbackWallPage.feedbackCardBody(title)).toHaveText(body);
      await expect(feedbackWallPage.feedbackCardAuthor(title)).toHaveText(seededUsers.admin.username);
      await expect(feedbackWallPage.feedbackCardReceiver(title)).toHaveText(seededUsers.jane.username);
      await expect(feedbackWallPage.feedbackCardAuthorAvatar(title)).toHaveAttribute(
        "src",
        feedbackWallPage.avatarSrc(seededUsers.admin.username),
      );
      await expect(feedbackWallPage.feedbackCardReceiverAvatar(title)).toHaveAttribute(
        "src",
        feedbackWallPage.avatarSrc(seededUsers.jane.username),
      );
    });
  });

  test("Shows a required-field validation error for the title when submitting a blank form", async ({
    createFormPage,
  }) => {
    await test.step("When submitting the form with all fields left blank", async () => {
      await createFormPage.submitButton.click();
    });

    await test.step("Then the dialog stays open and the title field shows a required-field validation error", async () => {
      await expect(createFormPage.dialog).toBeVisible();
      await expect(createFormPage.titleInput).toHaveJSProperty("validity.valid", false);
      await expect(createFormPage.titleInput).toHaveJSProperty("validationMessage", validationMessages.requiredField);
    });
  });

  test("Shows a required-field validation error for the comment after the title is filled in", async ({
    createFormPage,
  }) => {
    const { title } = buildFeedbackContent();

    await test.step("Given the title is filled in", async () => {
      await createFormPage.titleInput.fill(title);
    });

    await test.step("When submitting the form with the comment left blank", async () => {
      await createFormPage.submitButton.click();
    });

    await test.step("Then the dialog stays open and the comment field shows a required-field validation error", async () => {
      await expect(createFormPage.dialog).toBeVisible();
      await expect(createFormPage.commentInput).toHaveJSProperty("validity.valid", false);
      await expect(createFormPage.commentInput).toHaveJSProperty(
        "validationMessage",
        validationMessages.requiredField,
      );
    });
  });

  test("Shows a required-selection validation error for the receiver after the title and comment are filled in", async ({
    createFormPage,
  }) => {
    const { title, body } = buildFeedbackContent();

    await test.step("Given the title and comment are filled in", async () => {
      await createFormPage.titleInput.fill(title);
      await createFormPage.commentInput.fill(body);
    });

    await test.step("When submitting the form with no receiver selected", async () => {
      await createFormPage.submitButton.click();
    });

    await test.step("Then the dialog stays open and the receiver field shows a required-selection validation error", async () => {
      await expect(createFormPage.dialog).toBeVisible();
      await expect(createFormPage.receiverSelect).toHaveJSProperty("validity.valid", false);
      await expect(createFormPage.receiverSelect).toHaveJSProperty(
        "validationMessage",
        validationMessages.requiredSelection,
      );
    });
  });
});

test.describe("Cross-user feedback visibility", () => {
  test("Shows feedback sent by admin to jane on jane's feedback wall", async ({
    page,
    feedbackClient,
    authToken,
    tokenForUser,
    users,
  }) => {
    const jane = users.find((user) => user.username === seededUsers.jane.username);
    expect(jane, 'seeded user "jane" not found').toBeTruthy();

    const { title, body } = buildFeedbackContent();

    await test.step("Given admin sends feedback to jane via the API", async () => {
      const response = await feedbackClient.create(authToken, { title, body, receiverId: jane!.id });
      expect(response.status()).toBe(httpStatusCodes.ok);
    });

    const janeToken = await test.step("When jane signs in via the API", async () => {
      return tokenForUser(seededUsers.jane.username, seededUsers.jane.password);
    });

    const janeWallPage = await test.step("And jane opens her feedback wall", async () => {
      await setAccessToken(page, janeToken);
      await page.goto("/feedback");

      return new FeedbackWallPage(page);
    });

    await test.step("Then the feedback from admin appears on jane's wall with the full card", async () => {
      await expect(janeWallPage.feedbackCard(title)).toBeVisible();
      await expect(janeWallPage.feedbackCardHeading(title)).toHaveText(title);
      await expect(janeWallPage.feedbackCardBody(title)).toHaveText(body);
      await expect(janeWallPage.feedbackCardAuthor(title)).toHaveText(seededUsers.admin.username);
      await expect(janeWallPage.feedbackCardReceiver(title)).toHaveText(seededUsers.jane.username);
    });
  });
});

