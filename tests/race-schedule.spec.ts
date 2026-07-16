import { test, expect } from '@playwright/test';

test.describe('Race Schedule (Lịch đua) View Test', () => {
  const baseUrl = 'http://localhost:5173';

  test('should navigate to race schedule page and view details', async ({ page }) => {
    // 1. Navigate to portal homepage
    await page.goto(`${baseUrl}/portal`);
    
    // 2. Verify the homepage title/header is present
    await expect(page.locator('h1')).toContainText('Horse Racing Tournament Portal');

    // 3. Click the 'Race Schedule' button in the hero section
    const scheduleBtn = page.locator('[data-testid="hero-btn-races"]');
    await expect(scheduleBtn).toBeVisible();
    await scheduleBtn.click();

    // 4. Verify we are navigated to the races page
    await expect(page).toHaveURL(`${baseUrl}/portal/races`);

    // 5. Verify the header of the Race Schedule page
    await expect(page.locator('h1')).toContainText('Race Schedule');

    // 6. Verify tabs exist
    await expect(page.locator('button:has-text("All Races")')).toBeVisible();
    await expect(page.locator('button:has-text("Scheduled")')).toBeVisible();
    await expect(page.locator('button:has-text("Completed")')).toBeVisible();

    // 7. Check if there are races or empty state
    const emptyState = page.locator('text=No races found');
    const firstRaceDetailsBtn = page.locator('[data-testid^="btn-view-race-"]').first();

    if (await firstRaceDetailsBtn.isVisible()) {
      console.log('Races found, clicking detail button of the first race');
      await firstRaceDetailsBtn.click();
      
      // Verify we navigated to the race details page
      await expect(page).toHaveURL(/\/portal\/races\/\d+/);
      
      // Verify the details page content (e.g. Back to Schedule button or Details heading)
      await expect(page.locator('button:has-text("Back"), a:has-text("Back")').first()).toBeVisible();
    } else {
      console.log('No races found, verifying empty state message');
      await expect(emptyState).toBeVisible();
    }
  });
});
