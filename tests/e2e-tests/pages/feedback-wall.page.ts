import type { Locator, Page } from "@playwright/test";

export class FeedbackWallPage {
  readonly page: Page;
  readonly root: Locator;
  readonly heading: Locator;
  readonly createNewButton: Locator;
  readonly signOutLink: Locator;
  readonly emptyState: Locator;
  readonly fullscreenToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId("feedback-wall-page");
    this.heading = this.root.getByTestId("feedback-wall-heading");
    this.createNewButton = this.root.getByTestId("feedback-wall-create-new-button");
    this.signOutLink = page.getByTestId("sign-out-link");
    this.emptyState = this.root.getByTestId("feedback-wall-empty-state");
    this.fullscreenToggle = this.root.getByTestId("feedback-wall-fullscreen-toggle");
  }

  async toggleFullscreen() {
    await this.fullscreenToggle.click();
  }

  async exitFullscreenProgrammatically() {
    await this.page.evaluate(() => document.exitFullscreen());
  }

  isBrowserFullscreen(): Promise<boolean> {
    return this.page.evaluate(() => !!document.fullscreenElement);
  }

  async goto() {
    await this.page.goto("/feedback");
  }

  async openCreateForm() {
    await this.createNewButton.click();
  }

  async signOut() {
    await this.signOutLink.click();
  }

  feedbackCard(title: string): Locator {
    return this.root
      .getByTestId("feedback-item")
      .filter({ has: this.page.getByTestId("feedback-item-title").filter({ hasText: title }) });
  }

  feedbackCardBetween(authorUsername: string, receiverUsername: string): Locator {
    return this.root
      .getByTestId("feedback-item")
      .filter({ has: this.page.getByTestId("feedback-item-author").filter({ hasText: authorUsername }) })
      .filter({ has: this.page.getByTestId("feedback-item-receiver").filter({ hasText: receiverUsername }) });
  }

  private cardField(card: Locator, testId: string): Locator {
    return card.getByTestId(testId);
  }

  feedbackCardHeading(title: string): Locator {
    return this.cardField(this.feedbackCard(title), "feedback-item-title");
  }

  feedbackCardAuthor(title: string): Locator {
    return this.cardField(this.feedbackCard(title), "feedback-item-author");
  }

  feedbackCardReceiver(title: string): Locator {
    return this.cardField(this.feedbackCard(title), "feedback-item-receiver");
  }

  feedbackCardBody(title: string): Locator {
    return this.cardField(this.feedbackCard(title), "feedback-item-body");
  }

  feedbackCardAuthorAvatar(title: string): Locator {
    return this.cardField(this.feedbackCard(title), "feedback-item-author-avatar");
  }

  feedbackCardReceiverAvatar(title: string): Locator {
    return this.cardField(this.feedbackCard(title), "feedback-item-receiver-avatar");
  }

  avatarSrc(username: string): string {
    return `https://avatars.dicebear.com/api/initials/${username}.svg`;
  }
}
