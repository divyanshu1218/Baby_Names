import { chromium, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const DOWNLOAD_DIR = path.join(__dirname, '../../downloads');

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}
async function waitForElement(page: Page, selector: string, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }}
async function downloadFromKaggle() {
  let browser;
  try {
    console.log('Kicking off the Kaggle download...');

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      acceptDownloads: true,
    });
    const page = await context.newPage();
    console.log('Heading to Kaggle');
    await page.goto('https://www.kaggle.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    
    console.log('if logged in...');
    const isLoggedIn = await page.evaluate(() => {
      return !!document.querySelector('[data-testid="profileIcon"]');
    });

    if (!isLoggedIn) {
      console.log('Not logged in, gotta sign in...');

      // Go to login page
      await page.goto('https://www.kaggle.com/account/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      // Hit that "Sign in with Email" button
      console.log('Clicking the email sign-in button...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(btn => btn.textContent?.includes('Sign in with Email'));
        if (btn) {
          (btn as HTMLElement).click();
        }
      });
      console.log('Clicked it');
      await page.waitForTimeout(4000);

      // Debug stuff - checking inputs
      console.log('Looking for input fields...');
      const inputInfo = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        return inputs.map((inp: any) => ({
          type: inp.type,
          name: inp.name,
          id: inp.id,
          placeholder: inp.placeholder,
          visible: inp.offsetParent !== null
        }));
      });
      console.log('Found these inputs:', inputInfo);

      // email
      console.log('Filling in email...');
      await page.fill('input[name="email"]', process.env.KAGGLE_EMAIL!);
      console.log('Email done');
      await page.waitForTimeout(1000);

      //  password
      console.log('Filling in password...');
      await page.fill('input[name="password"]', process.env.KAGGLE_PASSWORD!);
      console.log('Password done');
      await page.waitForTimeout(1000);

      // Submit the form
      console.log('Submitting the login...');
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
      } else {
        throw new Error('No submit button found');
      }

      // Wait for login
      console.log('Waiting for login to finish...');
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {
        console.log('Navigation done or timed out');
      });
      await page.waitForTimeout(3000);
    } else {
      console.log('Already logged in, sweet!');
    }

    // Go to dataset page
    console.log('Heading to the dataset...');
    const datasetUrl = 'https://www.kaggle.com/datasets/thedevastator/us-baby-names-by-year-of-birth?select=babyNamesUSYOB-full.csv';
    await page.goto(datasetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    // Scroll down to find the download button
    console.log('Scrolling down to spot the download icon...');
    await page.evaluate(() => {
      window.scrollBy(0, 300);
    });
    await page.waitForTimeout(2000);

    console.log('Scanning for download buttons...');
    const downloadElements = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      return allElements
        .filter(el => {
          const ariaLabel = el.getAttribute('aria-label') || '';
          const title = el.getAttribute('title') || '';
          const dataTestId = el.getAttribute('data-testid') || '';
          return ariaLabel.toLowerCase().includes('download') ||
                 title.toLowerCase().includes('download') ||
                 dataTestId.toLowerCase().includes('download');
        })
        .map((el: any) => ({
          tag: el.tagName,
          ariaLabel: el.getAttribute('aria-label'),
          title: el.getAttribute('title'),
          dataTestId: el.getAttribute('data-testid'),
          class: el.className.substring(0, 50)
        }));
    });

    console.log('Found these download elements:', JSON.stringify(downloadElements, null, 2));

    console.log('Setting up download listener...');
    const downloadPromise = page.waitForEvent('download', { timeout: 20000 });

    // Click the download button
    console.log('Clicking the download button...');
    await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      const downloadEl = allElements.find(el => {
        const ariaLabel = el.getAttribute('aria-label') || '';
        const title = el.getAttribute('title') || '';
        return ariaLabel.toLowerCase().includes('download') ||
               title.toLowerCase().includes('download');
      }) as HTMLElement;

      if (downloadEl) {
        downloadEl.click();
      }
    });

    await page.waitForTimeout(2000);

    // download
    console.log('Waiting for download to kick off...');
    const download = await downloadPromise;
    const filename = await download.suggestedFilename();

    console.log(`Downloading: ${filename}`);
    const filePath = path.join(DOWNLOAD_DIR, filename);
    await download.saveAs(filePath);

    console.log(`Download successful!`);
    console.log(`Saved to: ${filePath}`);

    await context.close();
    await browser.close();

    return filePath;

  } catch (error) {
    console.error('Something went wrong with the download:', error);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

export default downloadFromKaggle;