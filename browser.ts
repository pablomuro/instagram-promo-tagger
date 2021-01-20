import puppeteer from 'puppeteer'

export const getBrowser = async (isHeadlessBrowser = true) => {
  let browser
  try {
    browser = await puppeteer.launch({
      headless: isHeadlessBrowser,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--disable-features=site-per-process',
        '--window-position=0,0',
        '--disable-extensions',
        '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X   10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0    Safari/537.36"'
      ]
    });
  }
  catch (e) {
    if (browser) {
      await browser.close();
    }
    throw new Error('Browser Launch Error')
  }

  return browser;
};