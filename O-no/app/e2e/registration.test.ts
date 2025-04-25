import { expect, test } from '@playwright/test';
import { pb } from '../src/lib/pb/pocketbase';

const timestamp = Date.now();
const testUsername = `testuser${timestamp}`;
const testEmail = `test${timestamp}@example.com`;
const testPassword = 'Password123!';

test.afterAll(async () => {
	try {
		const users = await pb.collection('users').getList(1, 10, {
			filter: `username = "${testUsername}"`
		});

		if (users.items.length > 0) {
			await pb.collection('users').delete(users.items[0].id);
			console.log(`Test user ${testUsername} deleted successfully`);
		}
	} catch (error) {
		console.error('Error cleaning up test user:', error);
	}
});

test('registration page shows error message when passwords do not match', async ({ page }) => {
	await page.goto('/registration');

	await page.fill('input[placeholder="Username"]', testUsername);
	await page.fill('input[placeholder="Email"]', testEmail);
	await page.fill('input[placeholder="Password"]', testPassword);
	await page.fill('input[placeholder="Confirm Password"]', 'DifferentPassword123!');
	await page.click('button[type="submit"]');

	await expect(page.locator('.text-red-600')).toBeVisible();
	await expect(page.locator('.text-red-600')).toHaveText('Passwords do not match!');
});

test('registration page shows success message on successful registration', async ({ page }) => {
	await page.goto('/registration');

	await page.fill('input[placeholder="Username"]', testUsername);
	await page.fill('input[placeholder="Email"]', testEmail);
	await page.fill('input[placeholder="Password"]', testPassword);
	await page.fill('input[placeholder="Confirm Password"]', testPassword);
	await page.click('button[type="submit"]');

	await expect(page.locator('.text-green-600')).toBeVisible();
	await expect(page.locator('.text-green-600')).toHaveText('Account created!');
});
