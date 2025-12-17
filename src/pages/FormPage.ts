import BasePage from './BasePage';
import { Page, expect } from '@playwright/test';

export default class FormPage extends BasePage {
  // Navigation selectors
  private automationMenu = 'nav a:has-text("Automation"), [aria-label="Automation"], li:has-text("Automation")';
  private createDropdown = 'button:has-text("Create"), [aria-label="Create"], button.dropdown-toggle:has-text("Create")';
  // Flexible selector for Form entry under Create menu
  private formOption =
    'a:has-text("Form"), [role="menuitem"]:has-text("Form"), li:has-text("Form"), ' +
    // Fallbacks based on common identifiers
    '[data-testid*="form" i], [data-qa*="form" i], [class*="form" i]';
  
  // Form creation selectors
  private formNameInput = 'input[name="formName"], input[placeholder*="form name" i], input[placeholder*="name" i]';
  private descriptionInput = 'textarea[name="description"], textarea[placeholder*="description" i]';
  private createBtn = 'button:has-text("Create"), button[type="submit"]:has-text("Create")';
  
  // Left menu selectors (for drag and drop elements)
  private leftMenu = '[class*="left-menu"], [class*="toolbox"], [class*="elements"], [class*="components"], aside, [class*="sidebar"]';
  private textboxElement = 'text=Textbox, [title="Textbox"], div:has-text("Textbox"), [data-element="textbox"]';
  private selectFileElement = 'text=Select File, text=File Upload, [title="Select File"], [title="File Upload"], div:has-text("Select File"), div:has-text("File Upload"), [data-element="file-upload"]';
  
  // Canvas selectors
  private canvas = '[class*="canvas"], [class*="form-canvas"], [class*="workspace"], [class*="designer"], main [class*="content"]';
  
  // Right panel selectors for verification
  private rightPanel = '[class*="right-panel"], [class*="properties"], [class*="config"], [class*="panel"][class*="right"]';
  private labelInput = 'input[name="label"], input[placeholder*="label" i]';
  private requiredCheckbox = 'input[type="checkbox"][name*="required" i], input[type="checkbox"]';
  private placeholderInput = 'input[name="placeholder"], input[placeholder*="placeholder" i]';
  
  // File upload selectors
  private fileInput = 'input[type="file"], input[accept]';
  private uploadButton = 'button:has-text("Upload"), button[type="button"]:has-text("Upload")';
  
  // Save and confirmation
  private saveBtn = 'button:has-text("Save"), button[type="submit"]:has-text("Save")';
  private saveSuccessToast = 'text=/saved successfully/i, text=/uploaded successfully/i, [class*="toast"][class*="success"]';
  private confirmationMessage = 'text=/form.*saved/i, text=/successfully/i';

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
   * Open Create dropdown and select Form
   */
  async openCreateForm() {
    // Click Create dropdown
    await this.page.locator(this.createDropdown).first().click();
    await this.page.waitForTimeout(500); // Wait for dropdown to open
    // Select Form option
    await this.page.locator(this.formOption).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill mandatory details and create form
   */
  async fillFormDetails(name: string, description?: string) {
    // Fill form name (mandatory)
    await this.page.locator(this.formNameInput).first().fill(name);
    
    // Fill description if provided (may be mandatory in some versions)
    if (description) {
      await this.page.locator(this.descriptionInput).first().fill(description);
    }
    
    // Click Create button
    await this.page.locator(this.createBtn).first().click();
    await this.page.waitForLoadState('networkidle');
    
    // Wait for form designer/canvas to load
    await this.page.locator(this.canvas).first().waitFor({ state: 'visible' });
  }

  /**
   * Drag and drop Textbox element from left menu to canvas
   */
  async dragDropTextbox() {
    // Wait for left menu to be visible
    await this.page.locator(this.leftMenu).first().waitFor({ state: 'visible' });
    
    // Find the Textbox element in left menu
    const textboxSource = this.page.locator(this.textboxElement).first();
    await expect(textboxSource).toBeVisible();
    
    // Find the canvas target
    const canvasTarget = this.page.locator(this.canvas).first();
    await expect(canvasTarget).toBeVisible();
    
    // Perform drag and drop
    await textboxSource.dragTo(canvasTarget);
    await this.page.waitForTimeout(500); // Wait for element to be added to canvas
  }

  /**
   * Drag and drop Select File element from left menu to canvas
   */
  async dragDropSelectFile() {
    // Wait for left menu to be visible
    await this.page.locator(this.leftMenu).first().waitFor({ state: 'visible' });
    
    // Find the Select File element in left menu
    const fileSource = this.page.locator(this.selectFileElement).first();
    await expect(fileSource).toBeVisible();
    
    // Find the canvas target
    const canvasTarget = this.page.locator(this.canvas).first();
    await expect(canvasTarget).toBeVisible();
    
    // Perform drag and drop
    await fileSource.dragTo(canvasTarget);
    await this.page.waitForTimeout(500); // Wait for element to be added to canvas
  }

  /**
   * Click on an element (after it's on canvas) and verify UI interactions in right panel
   */
  async clickElementAndVerifyRightPanel(elementSelector: string, elementLabel: string) {
    // Click on the element in canvas
    const element = this.page.locator(elementSelector).first();
    await element.click();
    await this.page.waitForTimeout(300); // Wait for right panel to update
    
    // Verify right panel is visible
    await this.page.locator(this.rightPanel).first().waitFor({ state: 'visible' });
    await expect(this.page.locator(this.rightPanel)).toBeVisible();
    
    // Verify label input is visible and enabled
    const labelInput = this.page.locator(this.labelInput).first();
    await expect(labelInput).toBeVisible();
    await expect(labelInput).toBeEnabled();
    
    // Fill label if not already filled
    const currentValue = await labelInput.inputValue();
    if (!currentValue) {
      await labelInput.fill(elementLabel);
    }
    
    // Verify placeholder input if present
    const placeholderInput = this.page.locator(this.placeholderInput).first();
    const placeholderCount = await placeholderInput.count();
    if (placeholderCount > 0) {
      await expect(placeholderInput).toBeVisible();
    }
    
    // Verify required checkbox if present
    const requiredCheckbox = this.page.locator(this.requiredCheckbox).first();
    const checkboxCount = await requiredCheckbox.count();
    if (checkboxCount > 0) {
      await expect(requiredCheckbox).toBeVisible();
    }
  }

  /**
   * Enter text in textbox element
   */
  async enterTextInTextbox(text: string) {
    // Find the textbox input in the canvas/form preview
    const textboxInput = this.page.locator('input[type="text"], textarea').first();
    await expect(textboxInput).toBeVisible();
    await textboxInput.fill(text);
  }

  /**
   * Upload a document/file
   */
  async uploadDocument(filePath: string) {
    // Find file input (may be in the canvas or in right panel when file element is selected)
    const fileInput = this.page.locator(this.fileInput).first();
    await expect(fileInput).toBeVisible();
    
    // Upload the file
    await fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(1000); // Wait for upload to process
    
    // Verify upload button or success indicator if present
    const uploadButton = this.page.locator(this.uploadButton).first();
    const buttonCount = await uploadButton.count();
    if (buttonCount > 0) {
      await uploadButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Save the form
   */
  async saveForm() {
    // Click Save button
    await Promise.all([
      this.page.waitForResponse(r => r.status() >= 200 && r.status() < 300),
      this.page.locator(this.saveBtn).first().click()
    ]);
    
    // Wait for success confirmation
    await this.page.waitForTimeout(1000);
    
    // Verify success message
    await expect(
      this.page.locator(this.saveSuccessToast).or(this.page.locator(this.confirmationMessage))
    ).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify document is uploaded successfully
   */
  async verifyDocumentUploaded(fileName: string) {
    // Check for file name in the UI or success message
    const fileIndicator = this.page.locator(`text=${fileName}, [title="${fileName}"]`).first();
    const count = await fileIndicator.count();
    if (count > 0) {
      await expect(fileIndicator).toBeVisible();
    }
    
    // Also verify success message
    await expect(
      this.page.locator(this.saveSuccessToast).or(this.page.locator(this.confirmationMessage))
    ).toBeVisible();
  }

  /**
   * Complete flow: Create form with textbox and file upload following assignment steps
   */
  async createFormWithUpload(formName: string, textboxLabel: string, fileUploadLabel: string, textValue: string, filePath: string) {
    // Step 1: Navigate to Automation
    await this.navigateToAutomation();
    
    // Step 2: Click Create dropdown and select Form
    await this.openCreateForm();
    
    // Step 3: Fill mandatory details and create
    await this.fillFormDetails(formName);
    
    // Step 4: Drag and drop Textbox from left menu to canvas
    await this.dragDropTextbox();
    
    // Step 5: Click on Textbox and verify UI interactions in right panel
    await this.clickElementAndVerifyRightPanel(this.textboxElement, textboxLabel);
    
    // Step 6: Drag and drop Select File from left menu to canvas
    await this.dragDropSelectFile();
    
    // Step 7: Click on Select File and verify UI interactions in right panel
    await this.clickElementAndVerifyRightPanel(this.selectFileElement, fileUploadLabel);
    
    // Step 8: Enter text in textbox
    await this.enterTextInTextbox(textValue);
    
    // Step 9: Upload document
    await this.uploadDocument(filePath);
    
    // Step 10: Save form
    await this.saveForm();
    
    // Step 11: Verify document uploaded successfully
    const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || 'file';
    await this.verifyDocumentUploaded(fileName);
  }
}
