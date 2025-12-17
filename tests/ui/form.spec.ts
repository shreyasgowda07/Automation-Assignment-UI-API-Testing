import { test, expect } from '@playwright/test';
import LoginPage from '../../src/pages/LoginPage';
import FormPage from '../../src/pages/FormPage';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

test.describe('Use Case 2: Form with Upload Flow (UI Automation)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.UI_BASE_URL || '/');
  });

  test('should create a form with textbox and file upload following assignment steps', async ({ page }) => {
    const login = new LoginPage(page);
    const form = new FormPage(page);

    // Step 1: Log in to the application
    await login.login(process.env.UI_USERNAME || '', process.env.UI_PASSWORD || '');
    await login.expectLoggedIn();

    // Generate unique form name
    const formName = `e2e-form-${Date.now()}`;
    const textboxLabel = 'Comment';
    const fileUploadLabel = 'Upload Document';
    const textValue = 'This is test text entered in the textbox';
    
    // File to upload (from shared folder/assets)
    const fileToUpload = path.resolve(process.cwd(), 'tests', 'assets', 'sample.txt');

    // Steps 2-8: Complete form creation flow with drag & drop, verification, and upload
    await form.createFormWithUpload(
      formName,
      textboxLabel,
      fileUploadLabel,
      textValue,
      fileToUpload
    );

    // Verify form is created and visible (assertion for form submission behavior)
    await expect(page.locator(`text=${formName}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('should verify UI element visibility and file upload functionality', async ({ page }) => {
    const login = new LoginPage(page);
    const form = new FormPage(page);

    // Login
    await login.login(process.env.UI_USERNAME || '', process.env.UI_PASSWORD || '');
    await login.expectLoggedIn();

    // Navigate to Automation
    await form.navigateToAutomation();
    
    // Verify Automation page loaded
    await expect(page).toHaveURL(/automation/i, { timeout: 10000 });

    // Open Create Form
    await form.openCreateForm();

    // Create form
    const formName = `test-form-${Date.now()}`;
    await form.fillFormDetails(formName);

    // Verify canvas is visible
    await expect(page.locator('[class*="canvas"], [class*="form-canvas"]').first()).toBeVisible();

    // Drag and drop Textbox
    await form.dragDropTextbox();

    // Click Textbox and verify right panel interactions
    await form.clickElementAndVerifyRightPanel('[class*="textbox"], input[type="text"]', 'Test Textbox');

    // Drag and drop File Upload
    await form.dragDropSelectFile();

    // Click File Upload and verify right panel interactions
    await form.clickElementAndVerifyRightPanel('[class*="file"], input[type="file"]', 'Test File Upload');

    // Enter text in textbox
    await form.enterTextInTextbox('Test input text');

    // Upload file
    const fileToUpload = path.resolve(process.cwd(), 'tests', 'assets', 'sample.txt');
    await form.uploadDocument(fileToUpload);

    // Save form
    await form.saveForm();

    // Verify file upload success
    await form.verifyDocumentUploaded('sample.txt');
  });
});
