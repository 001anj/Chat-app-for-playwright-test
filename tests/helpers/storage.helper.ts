import type { Page } from "@playwright/test";

const ACCESS_TOKEN_KEY = "accessToken";

/**
 * Seeds localStorage with an access token before the app's init script
 * runs, so the client boots already authenticated.
 */

export async function setAccessToken(page: Page, accessToken: string): Promise<void> {
  await page.addInitScript(
    ([key, token]) => window.localStorage.setItem(key, token),
    [ACCESS_TOKEN_KEY, accessToken],
  );
}
