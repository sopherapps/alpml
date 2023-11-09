/// <reference types="@jest/globals" />

require("expect-puppeteer");

describe("example", () => {
  beforeEach(async () => {
    await page.goto("http://localhost:3000");
  });

  it("should render sidebar", async () => {
    const sidebar = await page.$("[data-cy-sidebar]");
    const sidebarText = await page.evaluate((el) => el.textContent, sidebar);
    expect(sidebarText).toEqual("Hi ");
  });

  it("should render Jane navbar", async () => {
    const navbar = await page.$("[data-cy-navbar='Jane']");
    const navbarText = await page.evaluate((el) => el.textContent, navbar);
    expect(navbarText).toEqual("Navbar says hi Jane");
  });

  it("should render Paul navbar", async () => {
    const navbar = await page.$("[data-cy-navbar='Paul']");
    const navbarText = await page.evaluate((el) => el.textContent, navbar);
    expect(navbarText).toEqual("Navbar says hi Paul");
  });

  it("should render main content", async () => {
    const h2 = await page.$("[data-cy-main] > h2");
    const h2Text = await page.evaluate((el) => el.textContent, h2);
    expect(h2Text).toEqual("Main");

    const btn = await page.$("[data-cy-main] > [data-cy-content] > button");
    const btnText = await page.evaluate((el) => el.textContent, btn);
    expect(btnText).toEqual("Increment");

    const navbar = await page.$(
      "[data-cy-main] > [data-cy-content] > [data-cy-navbar='Rania']",
    );
    const navbarText = await page.evaluate((el) => el.textContent, navbar);
    expect(navbarText).toEqual("Navbar says hi Rania");

    const span = await page.$("[data-cy-main] > [data-cy-content] > span");
    const spanText = await page.evaluate((el) => el.textContent, span);
    expect(spanText).toEqual("50");
  });

  it("should maintain reactivity of elements", async () => {
    for (let i = 1; i < 5; i++) {
      const btn = await page.$("[data-cy-main] > [data-cy-content] > button");
      await btn.click();

      const span = await page.$("[data-cy-main] > [data-cy-content] > span");
      const spanText = await page.evaluate((el) => el.textContent, span);
      expect(spanText).toEqual(`${50 + i}`);
    }
  });
});
