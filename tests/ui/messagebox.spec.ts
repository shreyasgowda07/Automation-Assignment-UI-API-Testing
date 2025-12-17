import { test, expect } from '@playwright/test';
import LoginPage from '../../src/pages/LoginPage';
import MessageBoxPage from '../../src/pages/MessageBoxPage';
import dotenv from 'dotenv';

dotenv.config();

test.describe('Use Case 1: Message Box Task (UI Automation)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.UI_BASE_URL || '/');
  });

  test('should create a Message Box task following assignment steps', async ({ page }) => {
    const login = new LoginPage(page);
    const messageBox = new MessageBoxPage(page);

    // Step 1: Log in to the application
    await login.login(process.env.UI_USERNAME || '', process.env.UI_PASSWORD || '');
    await login.expectLoggedIn();

    // Generate unique task name
    const taskName = `e2e-message-${Date.now()}`;
    const messageText = 'This is an automated test message';
    const taskDescription = 'Message Box task created by automated test';

    // Steps 2-7: Complete Message Box task creation flow
    await messageBox.createMessageBoxTask(taskName, messageText, taskDescription);

    // Verify the created task appears in UI list (assertion for functional flow validation)
    await expect(page.locator(`text=${taskName}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('should verify UI element visibility and interactions', async ({ page }) => {
    const login = new LoginPage(page);
    const messageBox = new MessageBoxPage(page);

    // Login
    await login.login(process.env.UI_USERNAME || '', process.env.UI_PASSWORD || '');
    await login.expectLoggedIn();

    // Navigate to Automation
    await messageBox.navigateToAutomation();
    
    // Verify Automation page loaded
    await expect(page).toHaveURL(/automation/i, { timeout: 10000 });

    // Open Create Task Bot
    await messageBox.openCreateTaskBot();
    
    // Verify task creation form is visible
    await expect(page.locator('input[name="taskName"], input[placeholder*="name" i]').first()).toBeVisible();

    // Fill and create task
    const taskName = `test-task-${Date.now()}`;
    await messageBox.fillTaskDetails(taskName);

    // Add Message Box action
    await messageBox.addMessageBoxAction();

    // Verify right panel elements are visible and interactive
    await messageBox.verifyRightPanelElements();

    // Configure message box
    await messageBox.configureMessageBox('Test message');

    // Save and verify
    await messageBox.saveConfiguration();
  });
});
