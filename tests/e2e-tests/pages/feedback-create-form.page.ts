import type { Locator, Page } from "@playwright/test";

export class FeedbackCreateFormPage {
  readonly page: Page;
  readonly dialog: Locator;
  readonly titleInput: Locator;
  readonly commentInput: Locator;
  readonly receiverSelect: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByTestId("feedback-create-dialog");
    this.titleInput = this.dialog.getByTestId("feedback-create-title-input");
    this.commentInput = this.dialog.getByTestId("feedback-create-comment-input");
    this.receiverSelect = this.dialog.getByTestId("feedback-create-receiver-select");
    this.submitButton = this.dialog.getByTestId("feedback-create-submit-button");
  }

  async submit(input: { title: string; body: string; receiverUsername: string }) {
    await this.titleInput.fill(input.title);
    await this.commentInput.fill(input.body);
    await this.receiverSelect.selectOption({ label: input.receiverUsername });
    await this.submitButton.click();
  }
}
