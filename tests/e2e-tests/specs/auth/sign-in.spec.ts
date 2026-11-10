import { test, expect } from "../../../fixtures/pages.fixture";
import { FeedbackWallPage } from "../../pages/feedback-wall.page";
import { seededUsers } from "../../../test-data/users.data";
import { validationMessages } from "../../../test-data/validation-messages.data";

test.describe("Sign in test cases", () => {
  test.beforeEach(async ({ signInPage }) => {
    await test.step("Given the user is on the sign-in page", async () => {
      await signInPage.goto();
    });
  });

  test("Redirects to the feedback wall after signing in with valid credentials", async ({ page, signInPage }) => {
    await test.step("When admin signs in with valid credentials", async () => {
      await signInPage.signIn(seededUsers.admin.username, seededUsers.admin.password);
    });

    await test.step("Then admin is redirected to the feedback wall", async () => {
      const feedbackWallPage = new FeedbackWallPage(page);
      await expect(page).toHaveURL("/feedback");
      await expect(feedbackWallPage.heading).toBeVisible();
    });
  });

  test("Shows an error message when signing in with invalid credentials", async ({ signInPage }) => {
    await test.step("When admin attempts to sign in with an invalid password", async () => {
      await signInPage.signIn(seededUsers.admin.username, "wrong-password");
    });

    await test.step("Then an error message is shown to admin", async () => {
      await expect(signInPage.errorMessage).toBeVisible();
      await expect(signInPage.errorMessage).toHaveText("Wrong username or password");
    });
  });

  test("Shows a required-field validation error for each empty field in turn", async ({ signInPage }) => {
    await test.step("When submitting the form with both fields empty", async () => {
      await signInPage.submitButton.click();
    });

    await test.step("Then the username field shows a required-field validation error", async () => {
      await expect(signInPage.usernameInput).toHaveJSProperty("validity.valid", false);
      await expect(signInPage.usernameInput).toHaveJSProperty("validationMessage", validationMessages.requiredField);
    });

    await test.step("When filling in admin's username and submitting again", async () => {
      await signInPage.usernameInput.fill(seededUsers.admin.username);
      await signInPage.submitButton.click();
    });

    await test.step("Then the password field shows a required-field validation error", async () => {
      await expect(signInPage.passwordInput).toHaveJSProperty("validity.valid", false);
      await expect(signInPage.passwordInput).toHaveJSProperty("validationMessage", validationMessages.requiredField);
    });
  });

  test("Keeps admin on the feedback wall when navigating back to the sign-in page", async ({ page, signInPage }) => {
    await test.step("Given admin has signed in", async () => {
      await signInPage.signIn(seededUsers.admin.username, seededUsers.admin.password);
    });

    const feedbackWallPage = new FeedbackWallPage(page);
    await expect(feedbackWallPage.heading).toBeVisible();

    await test.step("When admin navigates back to the sign-in page", async () => {
      await page.goBack();
    });

    await test.step("Then admin stays on the feedback wall", async () => {
      await expect(feedbackWallPage.heading).toBeVisible();
      await expect(signInPage.form).not.toBeVisible();
      await expect(page).toHaveURL("/feedback");
    });
  });

  test("Returns to the sign-in page and clears the session", async ({ loggedInPage, feedbackWallPage, signInPage }) => {
    await test.step("When admin signs out from the feedback wall", async () => {
      await feedbackWallPage.signOut();
    });

    await test.step("Then admin returns to the sign-in page", async () => {
      await expect(loggedInPage).toHaveURL("/");
      await expect(signInPage.form).toBeVisible();
    });
  });
});
