import { Page, expect } from '@playwright/test';

export default abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = '/') {
    await this.page.goto(path);
  }

  async expectVisible(selector: string, message?: string) {
    await expect(this.page.locator(selector)).toBeVisible({ timeout: 7000 });
  }

  async expectText(selector: string, text: string) {
    await expect(this.page.locator(selector)).toHaveText(text);
  }
}
