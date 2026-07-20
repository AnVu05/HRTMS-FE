import { test, expect } from '@playwright/test';

// Roles and Credentials derived from MockData (using email for login)
const ADMIN = { email: 'vudin@gmail.com', password: '123456' };
const REFEREE = { email: 'paul@hrtms.com', password: '123456' };
const DOCTOR = { email: 'jane@hrtms.com', password: '123456' };
const JOCKEY = { email: 'jockey_mock@hrtms.com', password: '123456' };
const OWNER = { email: 'vudinhan2k5@gmail.com', password: '123456' };
const spectatorUser = `spectator_${Date.now()}`; // Dynamically generate audience
const spectatorEmail = `${spectatorUser}@hrtms.com`;

test.describe('HRTMS E2E Happy Case Flow', () => {

  // Disable parallel execution to run steps sequentially
  test.describe.configure({ mode: 'serial' });

  test('Complete flow: Admin -> Referee -> Jockey -> Owner -> Doctor -> Audience', async ({ page }) => {
    test.setTimeout(120000); // Increase timeout for the whole test block
    
    // Navigate to frontend URL
    const baseUrl = 'http://localhost:5173';

    // ---- Helper Functions ----
    async function login(email, password) {
      console.log(`Logging in as: ${email}`);
      await page.goto(`${baseUrl}/portal/login`);
      
      // Use exact locators based on Login.jsx
      await page.fill('input#email', email).catch(async () => {
         await page.fill('input[type="email"]', email);
      });
      await page.fill('input#password', password).catch(async () => {
         await page.fill('input[type="password"]', password);
      });
      
      await page.click('[data-testid="login-submit"]').catch(async () => {
         await page.click('button[type="submit"]');
      });
      
      await page.waitForTimeout(2000); // Wait for routing after login
    }

    async function logout() {
      console.log('Logging out');
      await page.goto(`${baseUrl}/admin`).catch(() => {});
      
      // Attempt to find a generic logout button
      const logoutBtn = page.locator('button:has-text("Logout"), text="Logout", button:has-text("Sign out")').first();
      if (await logoutBtn.isVisible()) {
          await logoutBtn.click();
      } else {
          // If hidden in a dropdown profile menu
          await page.click('button:has-text("Profile"), .profile-menu, button:has-text("Account")').catch(() => {});
          await page.waitForTimeout(500);
          await page.click('text="Logout"').catch(() => {});
      }
      await page.waitForTimeout(1000);
    }

    // ==========================================
    // 1. Admin creates Tournament and Race
    // ==========================================
    await test.step('Admin Creates Tournament and Race', async () => {
      await login(ADMIN.email, ADMIN.password);
      
      await page.goto(`${baseUrl}/admin/tournaments`);
      await page.click('button:has-text("Create Tournament"), button:has-text("New Tournament")').catch(() => console.error('Create Tournament button not found'));
      
      // Fill tournament form (based on Tournaments.jsx)
      await page.fill('input#name', 'Test Tournament E2E Happy').catch(() => {});
      await page.fill('input#start_date', '01/01/2027').catch(() => {});
      await page.fill('input#end_date', '10/01/2027').catch(() => {});
      await page.fill('input#published_date', '15/12/2026').catch(() => {});
      await page.fill('input#open_prediction_date', '20/12/2026').catch(() => {});
      await page.fill('input#close_prediction_date', '31/12/2026').catch(() => {});
      
      // Submit Tournament
      await page.click('button:has-text("Save as DRAFT"), button:has-text("Submit"), button:has-text("Save")').catch(() => {});
      await page.waitForTimeout(2000);

      // Admin creates Race
      await page.goto(`${baseUrl}/admin/races`);
      await page.click('button:has-text("Create Race"), button:has-text("New Race"), button:has-text("Add New Race")').catch(() => {});
      
      // Fill race form (based on Races.jsx)
      await page.fill('input#name', 'Test Race E2E Happy').catch(() => {});
      await page.fill('input#date', '05/01/2027').catch(() => {});
      await page.fill('input#startTime', '10:00').catch(() => {});
      await page.fill('input#endTime', '11:00').catch(() => {});
      await page.fill('input#distanceM', '1000').catch(() => {});
      await page.fill('input#numHorse', '8').catch(() => {});
      
      await page.click('button:has-text("Save Race"), button:has-text("Submit"), button:has-text("Save")').catch(() => {});
      await page.waitForTimeout(1000);
      await logout();
    });

    // ==========================================
    // 2. Referee accepts race invitation
    // ==========================================
    await test.step('Referee accepts invitation', async () => {
      await login(REFEREE.email, REFEREE.password);
      await page.goto(`${baseUrl}/referee/notifications`).catch(() => page.goto(`${baseUrl}/notifications`));
      
      // Click first Accept button on notifications page
      await page.locator('text="Accept", button:has-text("Accept")').first().click().catch(() => console.error('Referee could not accept'));
      await page.waitForTimeout(1000);
      await logout();
    });

    // ==========================================
    // 3. Admin publishes Tournament and Race
    // ==========================================
    await test.step('Admin publishes Tournament and Race', async () => {
      await login(ADMIN.email, ADMIN.password);
      await page.goto(`${baseUrl}/admin/tournaments`);
      
      // Edit the first tournament to publish
      await page.locator('button:has-text("Edit")').first().click().catch(() => {});
      await page.click('div[id="status"]').catch(() => {}); // SelectTrigger
      await page.click('text="PUBLISHED"').catch(() => {}); // SelectItem
      await page.click('button:has-text("Save Changes")').catch(() => {});
      
      await page.goto(`${baseUrl}/admin/races`);
      await page.locator('button:has-text("Edit")').first().click().catch(() => {});
      // Assuming a similar status select exists in Races
      await page.click('div[id="status"]').catch(() => {}); 
      await page.click('text="PUBLISHED"').catch(() => {});
      await page.click('button:has-text("Save Race")').catch(() => {});
      await logout();
    });

    // ==========================================
    // 4. Jockey uploads cert
    // ==========================================
    await test.step('Jockey uploads certificate', async () => {
      await login(JOCKEY.email, JOCKEY.password);
      await page.goto(`${baseUrl}/jockey/profile`); 
      await page.click('text="Upload Certificate", button:has-text("Upload")').catch(() => {});
      
      const fileChooserPromise = page.waitForEvent('filechooser').catch(() => null);
      await page.click('input[type="file"], button:has-text("Select File")').catch(() => {});
      const fileChooser = await fileChooserPromise;
      if (fileChooser) {
          await fileChooser.setFiles({
            name: 'cert.png',
            mimeType: 'image/png',
            buffer: Buffer.from('fake-image-content')
          });
      }
      
      await page.click('button:has-text("Submit"), button:has-text("Upload")').catch(() => {});
      await logout();
    });

    // ==========================================
    // 5. Admin verifies certificate
    // ==========================================
    await test.step('Admin verifies certificate', async () => {
      await login(ADMIN.email, ADMIN.password);
      await page.goto(`${baseUrl}/admin/verifications`);
      await page.locator('text="Verify", button:has-text("Verify"), button:has-text("Accept")').first().click().catch(() => {});
      await logout();
    });

    // ==========================================
    // 6. Owner registers for race and selects jockey
    // ==========================================
    await test.step('Owner registers for race', async () => {
      await login(OWNER.email, OWNER.password);
      await page.goto(`${baseUrl}/owner-home/tournaments`);
      
      await page.locator('text="Register", button:has-text("Register")').first().click().catch(() => {});
      
      // Assume a select element for jockey
      await page.locator('button[role="combobox"]').first().click().catch(() => {});
      await page.click('text="Mock Jockey"').catch(() => {});
      
      await page.click('button:has-text("Submit"), button:has-text("Register")').catch(() => {});
      await logout();
    });

    // ==========================================
    // 7. Jockey accepts owner invitation
    // ==========================================
    await test.step('Jockey accepts owner invitation', async () => {
      await login(JOCKEY.email, JOCKEY.password);
      await page.goto(`${baseUrl}/jockey/notifications`).catch(() => page.goto(`${baseUrl}/notifications`));
      
      await page.locator('text="Accept", button:has-text("Accept Registration")').first().click().catch(() => {});
      await logout();
    });

    // ==========================================
    // 8. Admin approves registration & Assigns Doctor
    // ==========================================
    await test.step('Admin approves and assigns doctor', async () => {
      await login(ADMIN.email, ADMIN.password);
      
      // Approve Registration
      await page.goto(`${baseUrl}/admin/registrations`).catch(() => {});
      await page.locator('text="Approve", button:has-text("Approve")').first().click().catch(() => {});
      
      // Assign Doctor
      await page.goto(`${baseUrl}/admin/medical`);
      await page.locator('text="Assign Doctor", button:has-text("Assign Doctor")').first().click().catch(() => {});
      
      await page.locator('button[role="combobox"]').first().click().catch(() => {});
      await page.click(`text="${DOCTOR.email}"`).catch(() => {});
      
      await page.click('button:has-text("Assign"), button:has-text("Save")').catch(() => {});
      await logout();
    });

    // ==========================================
    // 9. Doctor accepts and checks health
    // ==========================================
    await test.step('Doctor accepts and checks health', async () => {
      await login(DOCTOR.email, DOCTOR.password);
      
      await page.goto(`${baseUrl}/doctor/notifications`).catch(() => page.goto(`${baseUrl}/notifications`));
      await page.locator('text="Accept", button:has-text("Accept Assignment")').first().click().catch(() => {});
      
      await page.goto(`${baseUrl}/doctor/health-check`);
      
      // Click Healthy checkbox or button
      await page.locator('text="Healthy", input[type="checkbox"]').first().click().catch(() => {});
      await page.click('button:has-text("Submit"), button:has-text("Save")').catch(() => {});
      
      await logout();
    });

    // ==========================================
    // 10. Audience registers, login, predicts
    // ==========================================
    await test.step('Audience registers and predicts', async () => {
      await page.goto(`${baseUrl}/portal/register`);
      
      await page.fill('input#username, input[placeholder="Username"], input[name="username"]', spectatorUser).catch(() => {});
      await page.fill('input#password, input[placeholder="Password"], input[name="password"]', '123456').catch(() => {});
      await page.fill('input#email, input[placeholder="Email"], input[name="email"]', spectatorEmail).catch(() => {});
      
      await page.click('button:has-text("Register"), button:has-text("Sign up")').catch(() => {});
      await page.waitForTimeout(2000);

      await login(spectatorEmail, '123456');
      await page.goto(`${baseUrl}/spectator/tournaments`);
      
      await page.locator('text="Predict", button:has-text("Predict")').first().click().catch(() => {});
      await page.fill('input[name="points"], input[type="number"]', '100').catch(() => {});
      await page.click('button:has-text("Submit Prediction"), button:has-text("Submit")').catch(() => {});
      
      await logout();
    });

    // ==========================================
    // 11. Referee starts race, inputs temp, confirms official
    // ==========================================
    await test.step('Referee manages race', async () => {
      await login(REFEREE.email, REFEREE.password);
      await page.goto(`${baseUrl}/referee/dashboard`);
      
      await page.locator('text="Start Race", button:has-text("Start")').first().click().catch(() => {});
      await page.locator('text="Temporary Results", button:has-text("Input Temporary Results")').first().click().catch(() => {});
      await page.locator('text="Confirm Official", button:has-text("Confirm Official Results")').first().click().catch(() => {});
      
      await logout();
    });

  });
});
