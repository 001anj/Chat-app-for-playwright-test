---
name: playwright-author
description: "Creates, updates, and fixes Playwright tests (E2E/UI and API) using a layered, self-cleaning architecture: execution-model-first directory structure, thin API clients and Page Objects, composable fixtures, unique-content-scoped locators, actor-named narration, and per-test data cleanup via fixture teardown. Use when the user asks to create/add/write/update/fix Playwright tests, set up a new Playwright test suite, or scaffold API+E2E testing for a project. Prefer this over ad-hoc test writing even when the user does not mention this skill by name."
model: inherit
background: false
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
metadata:
  version: 1.0.0
---

# Playwright Author

**Use this skill when:** the user wants to create, add, write, fix, or update Playwright tests (E2E/UI and/or API), scaffold a new Playwright test suite from scratch, or bring an existing ad-hoc Playwright suite in line with a maintainable architecture.

**Do NOT use this skill when:** the user is asking about a different test framework without mentioning migration to Playwright, or only wants an explanation/review of existing tests with no authoring changes.

This skill encodes a battle-tested architecture and methodology developed and verified end-to-end on a real full-stack case study (Vue + Express/Prisma), not a theoretical template — every pattern below was exercised, debugged, and validated against real test runs and real CI failures. Apply the principles; adapt file/module names to the target project's actual stack and domain.

## Guiding philosophy

1. **Verify behavior before encoding it as an assertion.** Explore the real running system first — hit API endpoints manually (Postman/curl) to see actual status codes and error shapes, click through the UI yourself, and use `playwright-cli` (if available) to snapshot the DOM, read live JS properties, and inspect real network responses. Never assert what you'd *expect* the code to do — assert what you *confirmed* it does. This is how real defects get found instead of missed.
2. **Layers, not files.** Every test suite should separate: spec files (orchestrate + assert) → fixtures (wire dependencies, own setup/teardown) → page objects/API clients (know the DOM/endpoint shape, no assertions) → helpers/test-data factories (pure functions). Each layer depends only on the one below it.
3. **Clean up what you create, symmetrically with creation.** Don't rely solely on a global reseed at the start/end of a run. Per-test fixture teardown (not manual `afterEach` sprinkled per spec) should delete exactly what that test created, so it can't be forgotten in a new spec file and survives parallel workers correctly (no shared wipes racing).
4. **Name actors, not placeholders.** Test titles and `test.step` narration should read "leapsome submits feedback to jane" — not "the user submits a request." Real actor names make parallel CI logs scannable without opening the file.
5. **One outcome per test; assert real state.** Never assert existence alone (`toHaveCount`) — assert visibility *and* meaningful content (`toHaveText`). For native browser behavior (HTML5 validation popups), assert the underlying JS properties (`validity.valid`, `validationMessage`) that drive the popup, not the popup itself (it isn't part of the DOM and can't be reliably automated).
6. **Prefer deterministic checks over screenshots.** Before reaching for visual regression testing, ask if the thing you're verifying is actually a rendering/CSS concern, or just "is the right data/identity attached to the right element" — the latter is almost always better served by a DOM assertion (e.g. an `<img src>` built from a deterministic formula) than a fragile pixel diff, especially on any view that's a shared/growing list.
7. **Negative tests aren't padding — they're how you find real bugs.** Write tests against the documented contract (DTOs, validation decorators, route semantics), not against current behavior. When a negative test fails, that's often the suite doing its job, not a broken test — document it as a defect (expected vs. actual, root cause if found) rather than silently loosening the assertion.
8. **A name is a claim — only make claims you verified.** A method or test title that says "via Escape," "simulates a click," etc. asserts that mechanism actually happened. If you fall back to a different mechanism (e.g. `document.exitFullscreen()` instead of a real keypress) because you verified live that the "obvious" one doesn't reliably work in an automated browser, the name and the `test.step`/title text must say so — never leave the original, no-longer-accurate name in place. This is the same discipline as guiding philosophy #1, applied to naming instead of assertions.

## 1. Directory layout (execution-model-first, then feature)

```
tests/
├── api-tests/
│   ├── clients/          # thin request wrappers — no assertions, just create()/all()/etc.
│   ├── schemas/          # JSON Schema (or similar) for response shape validation
│   └── specs/<feature>/  # *.api.spec.ts, grouped by feature
├── e2e-tests/
│   ├── pages/            # Page Object Model — locators + thin actions, no assertions
│   └── specs/<feature>/  # *.spec.ts, grouped by feature
├── fixtures/             # test.extend() composition, shared by both suites
├── helpers/              # pure utility functions (no assertions, no test logic)
├── test-data/            # static data + factories (faker-based or similar)
├── global-setup.ts       # reseeds/baselines shared state once before the whole run
└── global-teardown.ts    # leaves a clean baseline once after the whole run
```

Split by **execution model first** (API vs UI) because they have fundamentally different setup costs and failure modes — mixing them in one spec file hides which layer actually broke. Split by **feature second** within each.

Configure Playwright `projects` (in `playwright.config.ts`) so either suite runs independently:
```ts
projects: [
  { name: "api", testDir: "./tests/api-tests/specs", testMatch: /.*\.api\.spec\.ts/, use: { baseURL: API_BASE_URL } },
  { name: "e2e-chromium", testDir: "./tests/e2e-tests/specs", use: { ...devices["Desktop Chrome"], baseURL: CLIENT_BASE_URL } },
]
```

## 2. API clients — thin, no assertions

```ts
export class FeedbackClient {
  constructor(private readonly request: APIRequestContext) {}

  create(accessToken: string | undefined, payload: Partial<Record<keyof CreatePayload, unknown>>): Promise<APIResponse> {
    return this.request.post("/feedback", {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      data: payload,
    });
  }

  all(accessToken: string | undefined): Promise<APIResponse> {
    return this.request.get("/feedback", { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined });
  }
}
```
Return the raw `APIResponse` and let the spec decide what to assert — this keeps the client reusable for both positive and negative tests without baking in expectations. Note that Playwright's `APIResponse` buffers its body, so `.json()`/`.text()` can safely be called more than once (unlike a native `fetch` `Response`) — useful for fixture-level tracking (see §4) without breaking the caller's own read.

## 3. Page Objects — locators + thin actions, scoped by unique content

```ts
export class FeedbackWallPage {
  constructor(private readonly page: Page) {
    this.root = page.getByTestId("feedback-wall-page");
  }

  // Scope every sub-locator off a uniquely-identified parent, not the raw testid list,
  // so an assertion can never accidentally read from the wrong item on a shared/growing list.
  feedbackCard(title: string): Locator {
    return this.root.getByTestId("feedback-item")
      .filter({ has: this.page.getByTestId("feedback-item-title").filter({ hasText: title }) });
  }

  feedbackCardAuthor(title: string): Locator {
    return this.feedbackCard(title).getByTestId("feedback-item-author");
  }
}
```

**Locator strategy, in priority order:** `data-testid`/`data-test-id` attributes first, always → stable element IDs second → role-based selectors (`getByRole`, `getByLabel`) third → CSS classes never (they change) → XPath only as an absolute last resort. Verify every selector against the live running page before using it — never guess from a spec or design doc; use `playwright-cli` or a manual DOM inspection to confirm.

For content that's inherently unique per test (a faker-generated title with a UUID appended, for instance), scope every locator off that content, not off list position or count — this is what keeps assertions correct even on a page that accumulates unrelated data across a full run.

**When the element you need has no testid of its own (e.g. a decorative `<img>` next to a labeled field), don't fall back to position (`.first()`/`.last()`) or a raw tag selector across the whole card — scope it structurally off the nearest element that *does* have a real testid**, e.g. `usernameLabel.locator("xpath=..").locator("img")` to get the avatar sitting next to a `feedback-item-author` label. Position-based selection silently breaks (reads the wrong element) the moment an unrelated element is added or reordered; sibling-of-a-testid selection doesn't.

## 4. Fixtures — composed in dependency layers, with built-in cleanup

Layer fixtures the way you'd layer any dependency graph — auth/API primitives at the base, feature-specific creation helpers next, page objects on top:

```
auth.fixture.ts      → apiRequestContext, authClient, feedbackClient, tokenForUser(username, password), authToken, users, ...
feature.fixture.ts   → createdEntity, entityFromOtherUsers  (built on top of auth.fixture)
pages.fixture.ts     → signInPage, featureWallPage, createFormPage  (built on top of feature.fixture)
```

**Generalize the "act as any actor" primitive early.** Instead of every test hardcoding its own sign-in call, expose a function fixture:
```ts
type TokenForUser = (username: string, password: string) => Promise<string>;

tokenForUser: async ({ authClient }, use) => {
  await use(async (username, password) => {
    const response = await authClient.signIn(username, password);
    expect(response.ok(), `sign-in failed for "${username}"`).toBeTruthy();
    return (await response.json()).accessToken;
  });
},
```
This is what makes multi-actor scenarios (A→B, C→D, cross-user visibility checks) a few lines instead of bespoke setup every time.

**Per-test cleanup lives in fixture teardown, not `afterEach`.** If the system under test has no delete endpoint (common), track what was created and clean up directly against the data layer (e.g. via the same ORM/ODM client the app itself uses) — but wire the tracking into the fixture that does the creating, not a separate step someone has to remember to add:

```ts
// Wrap the client to record what it creates, delegating everything else via `super`.
class CreationTracker extends FeedbackClient {
  readonly createdIds: number[] = [];
  async create(token: string | undefined, payload: unknown): Promise<APIResponse> {
    const response = await super.create(token, payload);
    if (response.ok()) {
      const body = await response.json();
      if (typeof body?.id === "number") this.createdIds.push(body.id);
    }
    return response;
  }
}

feedbackClient: async ({ apiRequestContext }, use) => {
  const client = new CreationTracker(apiRequestContext);
  await use(client);
  await deleteByIds(client.createdIds);   // only what THIS test made
},

// Also catch creation that happens purely through the UI, bypassing the API client:
page: async ({ page }, use) => {
  const createdIds: number[] = [];
  page.on("response", async (response) => {
    if (response.request().method() !== "POST" || !response.url().endsWith("/your-endpoint") || !response.ok()) return;
    try {
      const body = await response.json();
      if (typeof body?.id === "number") createdIds.push(body.id);
    } catch { /* non-JSON response, nothing to track */ }
  });
  await use(page);
  await deleteByIds(createdIds);
},
```

**Why this over `afterEach`:** it's symmetric with setup (creation and cleanup live in the same place) and it can't be forgotten in a new spec file — any test that calls the tracked client or submits the tracked UI flow gets cleanup automatically, with zero boilerplate in the test itself. It also survives parallel workers correctly, since each test only ever deletes the ids it made — never a shared wipe that could race another in-flight test.

## 5. Test data lifecycle — three cooperating layers, not one

| Layer | When it runs | What it guarantees |
|---|---|---|
| `global-setup.ts` | once, before the whole run | Baseline/seed state exists and is canonical — protects against a dirty/uninitialized environment (crashed prior run, manual tinkering, first-ever run) |
| Per-test fixture teardown (§4) | after every test that creates data | Only the rows/records *that specific test* created are removed |
| `global-teardown.ts` | once, after the whole run | Leaves a clean baseline for whoever/whatever runs next |

Don't skip the per-test layer and rely on global reseed alone — a shared, growing dataset across a whole run will eventually produce flaky assertions (or worse, tests that silently pass by accident because they matched the wrong record). Don't skip the global layer either — it's what makes the first test in a fresh/broken environment fail with a clear "seed data missing" signal instead of a confusing cascade.

## 6. Assertion & naming conventions

- Always assert visibility **and** meaningful content — never existence/count alone.
- One outcome per test. If a test's setup naturally produces a sequence (e.g. a form where fixing field A reveals a validation error on field B), that's a signal to split into one test per step, not one compound test — verify the actual sequence live (manual exploration / `playwright-cli`) before writing it.
- `test.describe`, test titles, and `test.step` calls should all read as a narrative with real actor names: `test("Rejects feedback from A to B with a missing title", ...)` → `test.step("When A submits feedback to B with no title", ...)` → `test.step("Then the request is rejected as a bad request", ...)`.
- All test/describe titles start with a capital letter.
- Use `test.beforeEach` for shared per-describe-block setup (e.g. opening a dialog) — reserve fixtures for cross-suite, cross-file reusable setup (auth, seeded state). A fixture for a single describe block's one-line setup is the wrong layer.
- Resolve actor identity the same way throughout a suite — if `seededUsers.jane.username` (or a `receiverUsername` fixture) is how every other test names the counterpart actor, a UI-only test in the same file shouldn't reintroduce the literal `"jane"` string. A hardcoded literal that duplicates a value already available from test-data/fixtures is a sign the test was written without checking how its neighbors do it.

## 7. When tests find real bugs — document, don't dilute

When a negative test (asserting the documented contract — DTO validation decorators, declared status codes) fails against current behavior, that's very likely a real defect, not a bad test. Document it with **expected vs. actual** and a root-cause hypothesis traced to a specific file/line, e.g.:

> Missing/invalid string fields are accepted (`200`) instead of rejected (`400`) — the validation library's decorators on the DTO don't appear to be enforced by the request pipeline.

Keep a `*_TEST_CASES.md` per suite (API and E2E) with a table: # | Test Case | Steps | Expected Result | Actual Result | Status. This turns "14 failing tests" into "4 root causes, each traced to a line," which is the difference between noise and a QA deliverable.

For a *known, currently-failing* defect you want the suite to keep documenting without it looking like CI regression noise, use Playwright's `test.fail()` annotation rather than leaving it as an ordinary failing assertion.

The same applies to a known *intermittent* issue that doesn't reliably fail (so `test.fail()` would be wrong too): record it as a numbered entry in `*_TEST_CASES.md` with expected vs. actual, not as an inline `// this sometimes fails because...` comment in the spec. A comment like that is invisible to anyone reading the CI report and gets forgotten the moment the file is touched for something else; a documented defect entry survives both.

## 8. CI

Mirror the exact local dev sequence in the workflow (install → generate/build → migrate/seed → start servers backgrounded → wait-on the ports → install browsers → run each project → publish reports). Split by execution model into independent workflow files (e.g. `api-test.yml`, `ui-test.yml`) so one suite's failure doesn't block the other's trigger or report, and publish each suite's report independently.

**When CI fails, don't guess a YAML fix from the symptom.** Pull the actual job/step logs (via the CI provider's API if the CLI isn't available) and find the real error line before changing anything. A "wait-on timeout" or "publish results" failure downstream is very often fallout from one earlier step failing for an unrelated reason (a dependency/environment mismatch, not a workflow bug) — check for a single root cause with everything after it `skipped` before assuming a cascade of unrelated problems. Verify any fix with a clean-room local reproduction of the exact CI sequence (fresh install, not an already-primed local environment) before trusting it.

**Trigger scope is a real decision, not a default to leave unexamined.** `workflow_dispatch`-only is appropriate while a pipeline is still being iterated on and verified; restore `push`/`pull_request` once it's confirmed working, so it becomes useful gating rather than something that fires broken runs on every commit.

## 9. Applying this to a brand-new project — checklist

1. Explore the running app manually first (API via Postman/curl, UI by clicking through) — confirm real behavior before writing anything.
2. Scaffold the directory layout from §1, matching the project's actual stack.
3. Write thin API clients (§2) and Page Objects (§3) for the flows in scope — verify every locator against the live page.
4. Build fixtures bottom-up (§4): auth/token primitives → feature creation helpers → page objects. Add the `tokenForUser`-style generalized actor primitive from the start, not as an afterthought.
5. Decide the cleanup strategy (§5) before writing more than a couple of tests — retrofitting cleanup after 20 tests exist is much more painful than building it into the first fixture.
6. Write positive AND negative tests against the documented contract, not just current behavior. Document any defects found (§7).
7. Wire CI to mirror the exact local sequence (§8); verify it with a clean-room reproduction before trusting a green run.
8. If asked to explain the resulting architecture to a technical stakeholder, produce a narrative document (not just file trees) that pairs "what it looks like" with "why" for each decision — this is what actually earns credibility in a review, not the number of tests.
