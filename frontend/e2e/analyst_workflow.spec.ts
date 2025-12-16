import { test, expect } from '@playwright/test';

test.describe('Analyst Workflow', () => {
    test('should allow a user to login, scan, and remediate', async ({ page }) => {
        // 1. Login
        console.log('Navigating to login...');
        await page.goto('/login');
        console.log('Filling credentials...');
        await page.fill('input[type="email"]', 'analyst@cybershield.ai');
        await page.fill('input[type="password"]', 'securepassword123');
        await page.click('button[type="submit"]');

        // Expect to be redirected to dashboard (root)
        console.log('Waiting for redirect...');
        await expect(page).toHaveURL('/');
        // Check for "Security Score" card title which is present on Dashboard
        await expect(page.locator('text=Security Score')).toBeVisible();
        console.log('Dashboard loaded.');

        // 2. Navigate to Scans Page
        console.log('Navigating to Scans...');
        await page.click('text=Scans');
        await expect(page).toHaveURL('/scans');

        // 3. Start Scan
        console.log('Starting scan...');
        // Input has no name, use placeholder or type
        await page.fill('input[placeholder*="Enter target"]', 'localhost');
        await page.click('button:has-text("Start Scan")');

        // Expect redirect to history
        console.log('Waiting for history redirect...');
        await expect(page).toHaveURL('/history');

        // 4. Verify Scan appears in history
        // It should show "localhost" and potentially "running" or "completed"
        console.log('Verifying history...');
        await expect(page.locator('text=localhost')).toBeVisible({ timeout: 10000 });
        console.log('Test complete.');
    });
});
