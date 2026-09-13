import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('CV Optimization Flow', () => {
  test('Complete CV Analysis and Job Match', async ({ page }) => {
    test.setTimeout(120000); // Allow 2 minutes for slow AI API calls
    
    // 1. Navigate and Authenticate
    await page.goto('/signin');
    
    // Developer bypass login
    await page.getByRole('button', { name: /Bypass Login \(Developer Mode\)/i }).click();
    
    // Wait for redirect to dashboard or just go directly to /upload
    await page.waitForURL('/dashboard');
    
    // 2. Upload Sample CV
    await page.goto('/upload');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/sample-cv.pdf'));
    await page.getByRole('button', { name: /Analyze Resume/i }).click();
    
    // Wait for the upload process and analysis to complete
    // We expect the 'Overall Score' to eventually appear after redirecting to dashboard
    await page.waitForURL('/dashboard', { timeout: 30000 });
    await expect(page.getByText(/Overall Score:/i)).toBeVisible({ timeout: 30000 });
    
    // Verify Score is a valid number format
    const scoreText = await page.locator('h2', { hasText: /Overall Score:/i }).innerText();
    expect(scoreText).toMatch(/Overall Score:\s*\d+%/i);

    // Assert the presence of some data sections (AI output is non-deterministic, so at least one should exist)
    const hasStrengths = await page.getByRole('heading', { name: 'Key Strengths' }).isVisible();
    const hasImprovements = await page.getByRole('heading', { name: 'Improvements' }).isVisible();
    const hasActionPlan = await page.getByRole('heading', { name: 'Action Plan' }).isVisible();
    expect(hasStrengths || hasImprovements || hasActionPlan).toBeTruthy();
    
    // Check Contact Information
    await expect(page.getByRole('heading', { name: 'Contact Information' })).toBeVisible();
    // We expect John Doe's email from fixture to be detected or flagged
    
    // Check Essential Sections
    await expect(page.getByRole('heading', { name: 'Essential Sections' })).toBeVisible();

    // 3. Target My CV (Job Match)
    // Find the button/link to switch to Target My CV view in the sidebar or nav
    const targetNav = page.locator('button, a').filter({ hasText: /^Target My CV$|^Job Match$/ }).first();
    await targetNav.click();

    // Paste Job Description
    const jdTextarea = page.getByPlaceholder(/Paste the complete job posting/i);
    await expect(jdTextarea).toBeVisible();
    
    await jdTextarea.fill(`
      Software Engineer
      Requirements:
      - 3+ years of experience in JavaScript, React, and Node.js.
      - Experience with Next.js and MongoDB.
      - Ability to manage and mentor junior developers.
    `);

    // Submit for Job Match Analysis
    await page.getByRole('button', { name: /Calculate Job Match/i }).click();

    // Wait for either Match Analysis Results or an error message
    const resultsHeading = page.getByRole('heading', { name: 'Match Analysis Results' });
    const errorMessage = page.locator('.bg-destructive\\/10'); // Error banner class
    
    await Promise.race([
      expect(resultsHeading).toBeVisible({ timeout: 60000 }),
      expect(errorMessage).toBeVisible({ timeout: 60000 })
    ]).catch(() => {
      throw new Error("Timed out waiting for Match Analysis Results or Error Message");
    });

    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.innerText();
      throw new Error(`Job Match failed with error: ${errorText}`);
    }
    
    // Verify Match Score
    await expect(page.getByText(/Overall Match Score/i).first()).toBeVisible();
    
    // Verify Matching Skills are generated (should find React, Node.js, etc.)
    const hasTailoring = await page.getByRole('heading', { name: 'Tailoring Recommendations' }).isVisible();
    const hasMatching = await page.getByRole('heading', { name: 'Matching Skills Found' }).isVisible();
    expect(hasTailoring || hasMatching).toBeTruthy();
  });
});
