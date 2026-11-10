import type { APIResponse } from "@playwright/test";
import { expect } from "@playwright/test";


export async function expectErrorMessage(response: APIResponse, expectedSubstring?: string): Promise<unknown> {
  const body = await response.json();

  expect(typeof body.message, "error response should include a message field").toBe("string");
  expect(body.message.length, "error response message should not be empty").toBeGreaterThan(0);

  if (expectedSubstring) {
    expect(body.message.toLowerCase()).toContain(expectedSubstring.toLowerCase());
  }

  return body;
}
