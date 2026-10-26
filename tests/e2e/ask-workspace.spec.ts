import { test, expect } from '@playwright/test';

test('ask question -> workspace with result', async ({ page }) => {
  // Go to home/playground
  await page.goto('/');
  
  // Try to find ask input - common patterns
  const askInput = page.locator('textarea, input[type="text"]').filter({ hasText: '' }).first();
  // Better: look for placeholder containing question/ask
  const questionInput = page.getByPlaceholder(/question|ask|crop|career/i).first();
  
  if (await questionInput.count() > 0) {
    await questionInput.fill('what crop should I plant in Musanze?');
    // Find submit button
    const submitBtn = page.getByRole('button', { name: /ask|analy|submit|go/i }).first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
    } else {
      await questionInput.press('Enter');
    }
  } else {
    // Navigate to ask/playground if exists
    await page.goto('/playground').catch(() => page.goto('/ask'));
    const input = page.locator('textarea').first();
    await input.fill('what crop should I plant in Musanze?');
    await page.getByRole('button', { name: /ask|analy/i }).first().click();
  }
  
  // Wait for result/workspace elements
  await page.waitForTimeout(10000);
  
  // Check for result indicators
  const hasResult = await page.locator('text=/crop|Sweet potato|Musanze|result|workspace|chart|table/i').count();
  expect(hasResult).toBeGreaterThan(0);
});

  // Check for result indicators
  const hasResult = await page.locator('text=/crop|Sweet potato|Musanze|result|workspace|chart|table/i').count();
  expect(hasResult).toBeGreaterThan(0);
});
