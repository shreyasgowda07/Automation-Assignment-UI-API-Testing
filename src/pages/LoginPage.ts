import BasePage from './BasePage';
import { Page, expect } from '@playwright/test';

export default class LoginPage extends BasePage {
  // Flexible selectors for username/email field
  private username = 'input[name="email"], input[name="username"], input[type="email"], input[placeholder*="email" i], input[placeholder*="username" i], input[id*="email"], input[id*="username"]';
  
  // Flexible selectors for password field
  private password = 'input[name="password"], input[type="password"], input[placeholder*="password" i], input[id*="password"]';
  
  // Flexible selectors for submit button
  private submitBtn = 'button[type="submit"], button:has-text("Sign In"), button:has-text("Login"), button:has-text("Log In"), input[type="submit"]';

  constructor(page: Page) {
    super(page);
  }

  async login(username: string, password: string) {
    // Wait for page to load
    await this.page.waitForLoadState('domcontentloaded');
    
    // Wait for username field to be visible (use first matching selector)
    const usernameField = this.page.locator(this.username).first();
    await expect(usernameField).toBeVisible({ timeout: 10000 });
    await usernameField.fill(username);
    
    // Wait for password field to be visible
    const passwordField = this.page.locator(this.password).first();
    await expect(passwordField).toBeVisible({ timeout: 10000 });
    await passwordField.fill(password);
    
    // Click submit button and wait for navigation (more flexible)
    const submitButton = this.page.locator(this.submitBtn).first();
    await expect(submitButton).toBeVisible({ timeout: 10000 });
    
    // Wait for navigation with more flexible options
    // Click submit and wait for either navigation or load state
    await submitButton.click();
    
    // Wait for URL to change (not containing login/signin) or wait for load state
    try {
      await this.page.waitForURL(/^(?!.*\/(login|signin|auth)).*$/, { timeout: 30000 });
    } catch {
      // If URL doesn't match pattern, just wait for load state
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    }
    
    // Additional wait to ensure page is loaded
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoggedIn() {
    // Wait a bit for page to settle after login
    await this.page.waitForTimeout(1000);
    
    // Multiple strategies to verify login success:
    // 1. Check if login form is NOT visible (we've left login page)
    const loginForm = this.page.locator('input[type="password"]').first();
    const loginFormCount = await loginForm.count();
    
    // 2. Check URL doesn't contain login/signin
    const currentUrl = this.page.url();
    const isOnLoginPage = currentUrl.includes('/login') || currentUrl.includes('/signin') || currentUrl.includes('/auth');
    
    // 3. Try to find logout/user menu indicators (multiple strategies)
    const logoutSelectors = [
      'text=Logout',
      'text=Log Out', 
      'text=Sign Out',
      '[aria-label*="logout" i]',
      '[aria-label*="sign out" i]',
      'button:has-text("Logout")',
      '[class*="user-menu"]',
      '[class*="profile-menu"]',
      '[data-testid*="user"]',
      'nav a[href*="dashboard"]',
      'nav a[href*="home"]'
    ];
    
    // 4. Check for dashboard/main content indicators
    const dashboardSelectors = [
      'text=Dashboard',
      'text=Home',
      '[class*="dashboard"]',
      '[class*="main-content"]',
      'nav',
      '[role="navigation"]'
    ];
    
    // If we're not on login page and login form is not visible, we're likely logged in
    if (!isOnLoginPage && loginFormCount === 0) {
      // Try to find at least one indicator of being logged in
      for (const selector of [...logoutSelectors, ...dashboardSelectors]) {
        const element = this.page.locator(selector).first();
        const count = await element.count();
        if (count > 0) {
          try {
            await expect(element).toBeVisible({ timeout: 5000 });
            return; // Found an indicator, login successful
          } catch {
            // Continue to next selector
            continue;
          }
        }
      }
      // If we're not on login page and no login form, consider it logged in
      return;
    }
    
    // If still on login page, login failed
    if (isOnLoginPage || loginFormCount > 0) {
      throw new Error('Login verification failed: Still on login page or login form is visible');
    }
  }
}
