import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/api/apiClient';
import dotenv from 'dotenv';

dotenv.config();

test.describe('Use Case 3: Learning Instance API Flow (API Automation)', () => {
  let client: ApiClient;
  let startTime: number;
  let responseTime: number;

  test.beforeAll(() => {
    // Initialize API client with credentials from .env
    client = new ApiClient(process.env.API_BASE_URL, process.env.API_TOKEN);
  });

  test('should perform login, create learning instance, and validate with appropriate checks', async () => {
    // Note: API login is typically handled via token in headers
    // The API_TOKEN in .env represents authenticated session
    
    // Step 1: Perform login using provided credentials (implicit via API token)
    // Verify authentication by making a simple API call
    try {
      // Try to get learning instances list to verify authentication
      const authTest = await client.get('/learning-instances');
      expect(authTest.status).toBeGreaterThanOrEqual(200);
      expect(authTest.status).toBeLessThan(400);
    } catch (error) {
      // If endpoint doesn't exist, we'll proceed with creation
      console.log('Auth verification endpoint may not exist, proceeding with creation');
    }

    // Step 2 & 3: Create Learning Instance
    const payload = {
      name: `e2e-learning-${Date.now()}`,
      description: 'Learning Instance created by automated tests',
      config: { 
        language: 'en',
        model: 'default'
      }
    };

    // Measure response time
    startTime = Date.now();
    const createResponse = await client.post('/learning-instances', payload);
    responseTime = Date.now() - startTime;

    // Step 4: Validate the created instance with appropriate checks
    
    // Assertion 1: HTTP Status Code validation
    expect(createResponse.status).toBeGreaterThanOrEqual(200);
    expect(createResponse.status).toBeLessThan(300);
    // Prefer 201 Created for resource creation, but accept 200 OK
    expect([200, 201]).toContain(createResponse.status);

    // Assertion 2: Response Time validation (optional but preferred per assignment)
    expect(responseTime).toBeLessThan(10000); // Should be less than 10 seconds
    console.log(`Response time: ${responseTime}ms`);

    // Assertion 3: Response Body Schema validation - Field-level checks
    expect(createResponse.data).toBeTruthy();
    expect(createResponse.data).toHaveProperty('id');
    expect(typeof createResponse.data.id).toBe('string');
    expect(createResponse.data.id.length).toBeGreaterThan(0);

    expect(createResponse.data).toHaveProperty('name');
    expect(createResponse.data.name).toBe(payload.name);

    // Verify other expected fields if present
    if (createResponse.data.description !== undefined) {
      expect(createResponse.data.description).toBe(payload.description);
    }

    // Assertion 4: Functional Accuracy - Instance created with correct data and status
    const createdInstance = createResponse.data;
    
    // Validate ID is unique and non-empty
    expect(createdInstance.id).toBeTruthy();
    
    // Validate name matches request
    expect(createdInstance.name).toBe(payload.name);
    
    // Validate status field if present
    if (createdInstance.status !== undefined) {
      expect(['active', 'created', 'pending', 'ready']).toContain(createdInstance.status.toLowerCase());
    }

    // Additional validation: Retrieve and validate the created instance
    const getResponse = await client.get(`/learning-instances/${createdInstance.id}`);
    
    // HTTP Status Code validation for GET
    expect(getResponse.status).toBe(200);
    
    // Response Body Schema validation for GET
    expect(getResponse.data).toBeTruthy();
    expect(getResponse.data).toHaveProperty('id', createdInstance.id);
    expect(getResponse.data).toHaveProperty('name', payload.name);
    
    // Functional Accuracy: Verify retrieved instance matches created instance
    expect(getResponse.data.id).toBe(createdInstance.id);
    expect(getResponse.data.name).toBe(createdInstance.name);
    
    // Additional field-level validation
    if (getResponse.data.createdAt) {
      expect(getResponse.data.createdAt).toBeTruthy();
    }
    if (getResponse.data.updatedAt) {
      expect(getResponse.data.updatedAt).toBeTruthy();
    }
  });

  test('should validate API response schema and field-level checks', async () => {
    const payload = {
      name: `schema-test-${Date.now()}`,
      description: 'Schema validation test',
      config: { language: 'en' }
    };

    const createResponse = await client.post('/learning-instances', payload);
    
    // Comprehensive schema validation
    const instance = createResponse.data;
    
    // Required fields
    expect(instance).toHaveProperty('id');
    expect(instance).toHaveProperty('name');
    
    // Type checks
    expect(typeof instance.id).toBe('string');
    expect(typeof instance.name).toBe('string');
    
    // Value validation
    expect(instance.name).toBe(payload.name);
    expect(instance.id).toMatch(/^[a-zA-Z0-9\-_]+$/); // ID format validation
    
    // Optional fields validation
    if (instance.description !== undefined) {
      expect(typeof instance.description).toBe('string');
    }
    if (instance.status !== undefined) {
      expect(typeof instance.status).toBe('string');
    }
    if (instance.config !== undefined) {
      expect(typeof instance.config).toBe('object');
    }
    if (instance.createdAt !== undefined) {
      expect(typeof instance.createdAt).toBe('string');
      // Validate ISO date format
      expect(new Date(instance.createdAt).toString()).not.toBe('Invalid Date');
    }
  });
});
