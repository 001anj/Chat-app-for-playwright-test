import type { Locator, Page } from "@playwright/test";

export class SignInPage {
  readonly page: Page;
  readonly form: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.getByTestId("login");
    this.usernameInput = page.getByTestId("sign-in-username-input");
    this.passwordInput = page.getByTestId("sign-in-password-input");
    this.submitButton = page.getByTestId("sign-in-submit-button");
    this.errorMessage = page.getByTestId("sign-in-error-message");
  }

  async goto() {
    await this.page.goto("/");
  }

  async signIn(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
