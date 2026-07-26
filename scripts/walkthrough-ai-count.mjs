/**
 * Cold login → Home glance AI count via Playwright.
 * Requires: npx vercel dev on :3000, then:
 *   node scripts/walkthrough-ai-count.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.WALKTHROUGH_BASE || 'http://localhost:3000';

async function health(reset = false) {
  const url = reset
    ? `${BASE}/api/health?resetGeminiCount=1`
    : `${BASE}/api/health`;
  const res = await fetch(url);
  return res.json();
}

async function main() {
  const beforeReset = await health(true);
  console.log('health after reset:', beforeReset);

  const email = `ai-count-${Date.now()}@example.com`;
  const password = 'Password1!';
  const name = 'Count Test';

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const reflectUrls = [];
  page.on('request', (req) => {
    if (req.url().includes('/api/ai/reflect') && req.method() === 'POST') {
      reflectUrls.push(req.url());
    }
  });

  await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' });
  await page.getByPlaceholder('Enter your full name').fill(name);
  await page.getByPlaceholder('example@wisdom.com').fill(email);
  await page.getByRole('button', { name: /open calendar/i }).click();
  await page.getByRole('button', { name: '15' }).first().click();
  const passwordInputs = page.locator('input[type="password"]');
  await passwordInputs.nth(0).fill(password);
  await passwordInputs.nth(1).fill(password);
  await page.getByRole('button', { name: /register/i }).click();

  // Land on Home — wait for auto AI calls to settle
  await page.waitForURL('**/', { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(8000);

  const after = await health(false);
  await browser.close();

  console.log(
    JSON.stringify(
      {
        email,
        apiReflectPosts: reflectUrls.length,
        geminiUpstreamCalls: after.geminiUpstreamCalls,
        note: 'Cold signup/login → Home glance only (no Reflect/Return clicks)',
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
