import { expect, test, type Page } from "@playwright/test";

async function enterMove(page: Page, move: string) {
  const input = page.getByLabel("La tua mossa", { exact: true });
  await expect(input).toBeEnabled();
  await input.fill(move);
  await page.getByRole("button", { name: "Gioca", exact: true }).click();
}

async function openLesson(page: Page, title: string) {
  await page
    .getByRole("button", { name: "I tuoi progressi", exact: true })
    .click();
  await page.getByRole("button", { name: new RegExp(title) }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("home fits the viewport and instructions close with Escape", async ({
  page,
}) => {
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Una pausa.",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Come funziona" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("click-to-move, full course, replay and persisted clean completions", async ({
  page,
}) => {
  await page.getByRole("button", { name: /01 LE BASI/ }).click();
  await page.locator('[data-square="e1"]').click();
  await page.locator('[data-square="e8"]').click();
  await expect(
    page.getByText("Hai visto l'idea.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Rivedi la linea" }).click();
  await expect(
    page.getByRole("button", { name: "Mossa precedente", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Mossa successiva", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Mossa successiva", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "La prossima idea" }).click();
  await enterMove(page, "a7a8");
  await page.getByRole("button", { name: "La prossima idea" }).click();
  await enterMove(page, "Qg7#");
  await page.getByRole("button", { name: "La prossima idea" }).click();
  await enterMove(page, "e8e1");
  await page.getByRole("button", { name: "Concludi", exact: true }).click();
  await expect(page.getByText(/Hai risolto/)).toContainText("4 di 4");
  await page.reload();
  await page
    .getByRole("button", { name: "I tuoi progressi", exact: true })
    .click();
  await expect(page.locator(".stat").first()).toContainText("4/8");
  await expect(page.locator(".stat").nth(1)).toContainText("4");
});

test("illegal input, wrong legal move, retry and hint do not count as a clean solve", async ({
  page,
}) => {
  await openLesson(page, "L'ultima traversa");
  await enterMove(page, "e1e9");
  await expect(page.getByRole("alert")).toContainText("Mossa non legale");
  await page.getByRole("button", { name: "Un piccolo indizio" }).click();
  await enterMove(page, "e1e2");
  await expect(
    page.getByText("Un'idea da rivedere.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("La tua mossa", { exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Riprova", exact: true }).click();
  await enterMove(page, "e1e8");
  await page.getByRole("button", { name: "Concludi", exact: true }).click();
  await expect(page.getByText(/Hai risolto/)).toContainText("0 senza errori");
});

test("multi-move puzzle automatically replies and completes only at the end", async ({
  page,
}) => {
  await openLesson(page, "Due problemi insieme");
  await enterMove(page, "f5e7");
  await expect(
    page.getByText("Bene. Continua il piano.", { exact: true }),
  ).toBeVisible();
  await enterMove(page, "e7d5");
  await expect(
    page.getByText("Hai visto l'idea.", { exact: true }),
  ).toBeVisible();
});

test("five-ply combination, solution review and resetting between puzzles", async ({
  page,
}) => {
  await openLesson(page, "Il prezzo della difesa");
  await enterMove(page, "Bxd7+");
  await expect(
    page.getByText("Bene. Continua il piano.", { exact: true }),
  ).toBeVisible();
  await enterMove(page, "Qb8+");
  // Wait for the CPU to change the position, not just for the already-enabled input.
  await expect(
    page.locator('[data-square="b8"] [data-piece="bN"]'),
  ).toBeVisible();
  await enterMove(page, "Rd8#");
  await expect(
    page.getByText("Hai visto l'idea.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Rivedi la linea" }).click();
  for (let index = 0; index < 5; index++)
    await page
      .getByRole("button", { name: "Mossa successiva", exact: true })
      .click();
  await expect(page.locator(".replay-controls")).toContainText("5/5");
});

test("promotion menu accepts a rook underpromotion mate", async ({ page }) => {
  await openLesson(page, "Il piccolo diventa grande");
  await page.locator('[data-square="f7"]').click();
  await page.locator('[data-square="f8"]').click();
  const promotion = page.locator(
    '.live-board div[style*="z-index: 1001"] button',
  );
  await expect(promotion).toHaveCount(4);
  await expect(
    page.getByRole("button", { name: "Donna", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Torre", exact: true }).click();
  await expect(
    page.getByText("Hai visto l'idea.", { exact: true }),
  ).toBeVisible();
});

test("sprint pause blocks moves, resume works and skipped puzzles are counted correctly", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Inizia lo sprint" }).click();
  await page.getByRole("button", { name: "Pausa sprint" }).click();
  await expect(page.getByLabel("La tua mossa", { exact: true })).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Salta", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Riprendi", exact: true }).click();
  await enterMove(page, "e1e8");
  await page.getByRole("button", { name: "La prossima idea" }).click();
  for (let index = 1; index < 8; index++)
    await page.getByRole("button", { name: "Salta", exact: true }).click();
  await expect(page.getByText(/Hai risolto/)).toContainText("1 di 8");
  await page
    .getByRole("button", { name: "Torna al club", exact: true })
    .click();
  await page
    .getByRole("button", { name: "I tuoi progressi", exact: true })
    .click();
  await expect(page.locator(".stat").nth(2)).toContainText("1");
});

test("sprint times out even while the tab is idle", async ({ page }) => {
  await page.clock.install();
  await page.getByRole("button", { name: "Inizia lo sprint" }).click();
  await expect(page.getByLabel("Tempo rimanente")).toHaveText("3:00");
  await page.clock.fastForward(181000);
  await expect(
    page.getByRole("heading", { name: "Una pausa ben spesa." }),
  ).toBeVisible();
  await expect(page.getByText(/Hai risolto/)).toContainText("0 di 8");
});

test("storage failure leaves practice usable and communicates its persistence limit", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Storage unavailable");
    };
  });
  await page.reload();
  await expect(
    page.getByText(/Il browser non permette il salvataggio/),
  ).toBeVisible();
  await openLesson(page, "L'ultima traversa");
  await enterMove(page, "e1e8");
  await expect(
    page.getByText("Hai visto l'idea.", { exact: true }),
  ).toBeVisible();
});

test("all screens render without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.reload();
  await openLesson(page, "Dall'altra parte");
  await page.getByRole("button", { name: "Ruota la scacchiera" }).click();
  await enterMove(page, "Re1#");
  await page.getByRole("button", { name: "Concludi", exact: true }).click();
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
