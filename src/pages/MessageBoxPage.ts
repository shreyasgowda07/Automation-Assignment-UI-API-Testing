import BasePage from './BasePage';
import { Page, expect } from '@playwright/test';

export default class MessageBoxPage extends BasePage {
  // Navigation selectors
  private automationMenu = 'nav a:has-text("Automation"), [aria-label="Automation"], li:has-text("Automation")';
  private createDropdown = 'button:has-text("Create"), [aria-label="Create"], button.dropdown-toggle:has-text("Create")';
  // Be very flexible with Task Bot naming and structure
  private taskBotOption =
    // Common textual variants
    'a:has-text("Task Bot"), a:has-text("TaskBot"), a:has-text("Task bot"), ' +
    '[role="menuitem"]:has-text("Task Bot"), [role="menuitem"]:has-text("TaskBot"), ' +
    'li:has-text("Task Bot"), li:has-text("TaskBot"), ' +
    // Fallbacks based on common attributes/classes
    '[data-testid*="task-bot" i], [data-qa*="task-bot" i], [class*="task-bot" i]';
  
  // Task creation selectors
  private taskNameInput = 'input[name="taskName"], input[placeholder*="task name" i], input[placeholder*="name" i]';
  private descriptionInput = 'textarea[name="description"], textarea[placeholder*="description" i]';
  private createBtn = 'button:has-text("Create"), button[type="submit"]:has-text("Create")';
  
  // Actions panel selectors
  private actionsPanel = '[class*="actions-panel"], [class*="action-panel"], aside, [class*="sidebar"]';
  private searchInput = 'input[placeholder*="search" i], input[type="search"], input[name="search"]';
  private messageBoxAction = 'text=Message Box, [title="Message Box"], div:has-text("Message Box")';
  
  // Right panel selectors for verification
  private rightPanel = '[class*="right-panel"], [class*="properties"], [class*="config"], [class*="panel"][class*="right"]';
  private messageInput = 'textarea[name="message"], textarea[placeholder*="message" i], input[name="message"]';
  private titleInput = 'input[name="title"], input[placeholder*="title" i]';
  
  // Save and confirmation
  private saveBtn = 'button:has-text("Save"), button[type="submit"]:has-text("Save")';
  private saveSuccessToast = 'text=/saved successfully/i, text=/created successfully/i, [class*="toast"][class*="success"]';
  private confirmationMessage = 'text=/task.*created/i, text=/successfully/i';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Automation menu from left-hand menu
   */
  async navigateToAutomation() {
    // Wait for navigation menu to be visible
    await this.page.waitForLoadState('networkidle');
    // Click on Automation menu item (left-hand menu)
    await this.page.locator(this.automationMenu).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Open Create dropdown and select Task Bot
   */
  async openCreateTaskBot() {
    // Click Create dropdown
    await this.page.locator(this.createDropdown).first().click();
    await this.page.waitForTimeout(500); // Wait for dropdown to open
    // Select Task Bot option
    await this.page.locator(this.taskBotOption).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill mandatory details and create task
   */
  async fillTaskDetails(name: string, description?: string) {
    // Fill task name (mandatory)
    await this.page.locator(this.taskNameInput).first().fill(name);
    
    // Fill description if provided (may be mandatory in some versions)
    if (description) {
      await this.page.locator(this.descriptionInput).first().fill(description);
    }
    
    // Click Create button
    await this.page.locator(this.createBtn).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search for Message Box in Actions panel and double-click to add
   */
  async addMessageBoxAction() {
    // Wait for Actions panel to be visible
    await this.page.locator(this.actionsPanel).first().waitFor({ state: 'visible' });
    
    // Search for Message Box
    const searchLocator = this.page.locator(this.searchInput).first();
    await searchLocator.fill('Message Box');
    await this.page.waitForTimeout(500); // Wait for search results
    
    // Double-click on Message Box to add it
    await this.page.locator(this.messageBoxAction).first().dblclick();
    await this.page.waitForTimeout(500); // Wait for action to be added
  }

  /**
   * Verify UI element interactions in the right panel
   */
  async verifyRightPanelElements() {
    // Wait for right panel to be visible
    await this.page.locator(this.rightPanel).first().waitFor({ state: 'visible' });
    
    // Verify message input field is visible and enabled
    const messageInput = this.page.locator(this.messageInput).first();
    await expect(messageInput).toBeVisible();
    await expect(messageInput).toBeEnabled();
    
    // Verify title input if present
    const titleInput = this.page.locator(this.titleInput).first();
    const titleCount = await titleInput.count();
    if (titleCount > 0) {
      await expect(titleInput).toBeVisible();
    }
    
    // Verify other common UI elements in right panel
    await expect(this.page.locator(this.rightPanel)).toBeVisible();
  }

  /**
   * Configure message box with message text
   */
  async configureMessageBox(message: string, title?: string) {
    // Fill message
    await this.page.locator(this.messageInput).first().fill(message);
    
    // Fill title if provided
    if (title) {
      const titleInput = this.page.locator(this.titleInput).first();
      const titleCount = await titleInput.count();
      if (titleCount > 0) {
        await titleInput.fill(title);
      }
    }
  }

  /**
   * Save the configuration
   */
  async saveConfiguration() {
    // Click Save button
    await Promise.all([
      this.page.waitForResponse(r => r.status() >= 200 && r.status() < 300),
      this.page.locator(this.saveBtn).first().click()
    ]);
    
    // Wait for success confirmation
    await this.page.waitForTimeout(1000);
    
    // Verify success message
    await expect(this.page.locator(this.saveSuccessToast).or(this.page.locator(this.confirmationMessage))).toBeVisible({ timeout: 10000 });
  }

  /**
   * Complete flow: Create Message Box task following assignment steps
   */
  async createMessageBoxTask(name: string, message: string, description?: string) {
    // Step 1: Navigate to Automation
    await this.navigateToAutomation();
    
    // Step 2: Click Create dropdown and select Task Bot
    await this.openCreateTaskBot();
    
    // Step 3: Fill mandatory details and create
    await this.fillTaskDetails(name, description);
    
    // Step 4: Search for Message Box in Actions panel and double-click
    await this.addMessageBoxAction();
    
    // Step 5: Verify UI elements in right panel
    await this.verifyRightPanelElements();
    
    // Step 6: Configure message box
    await this.configureMessageBox(message);
    
    // Step 7: Save configuration
    await this.saveConfiguration();
  }
}
