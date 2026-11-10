import { test as base } from "./feedback.fixture";
import { SignInPage } from "../e2e-tests/pages/sign-in.page";
import { FeedbackWallPage } from "../e2e-tests/pages/feedback-wall.page";
import { FeedbackCreateFormPage } from "../e2e-tests/pages/feedback-create-form.page";

type PageFixtures = {
  signInPage: SignInPage;
  feedbackWallPage: FeedbackWallPage;
  createFormPage: FeedbackCreateFormPage;
};

export const test = base.extend<PageFixtures>({
  signInPage: async ({ page }, use) => {
    await use(new SignInPage(page));
  },

  feedbackWallPage: async ({ loggedInPage }, use) => {
    await use(new FeedbackWallPage(loggedInPage));
  },

  createFormPage: async ({ loggedInPage }, use) => {
    await use(new FeedbackCreateFormPage(loggedInPage));
  },
});

export { expect } from "@playwright/test";
