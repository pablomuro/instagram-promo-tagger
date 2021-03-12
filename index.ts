import fs from 'fs'
import dotenv from 'dotenv'
import { getBrowser } from './browser'
import { getBetweenPostsTimeout, getBatchPostsTimeout } from './utils'
dotenv.config()

const _fs = fs.promises

const remainingFriendsFilePath = './json_files/remainingFriends.json';
const cookiesFilePath = './json_files/cookies.json';

try {
  if (!process.env.PROFILE) throw new Error('')

  if (!process.env.PROMO_URL) throw new Error('')

  if (!process.env.USER_NAME || !process.env.PASSWORD) {
    throw new Error('USERNAME or PASSWORD env variables missing')
  }
  if (!process.env.BATCH_NUMBER) throw new Error('BATCH_NUMBER env variables missing')
} catch (error) {
  console.log(error)
  process.exit(1)
}

const isHeadlessBrowser: boolean = (process.env.HEADLESS_BROWSER === 'true')
const userName = process.env.USER_NAME
const password = process.env.PASSWORD
const BATCH_NUMBER = Number(process.env.BATCH_NUMBER)

const instagramUrl = 'https://www.instagram.com/'
const profile = `${instagramUrl}${process.env.PROFILE}`
const promoUrl = process.env.PROMO_URL

const remainingFriends: any = JSON.parse(fs.readFileSync(remainingFriendsFilePath).toString())
const cookiesString = fs.readFileSync(cookiesFilePath).toString().replace("\n", '');

try {
  (async () => {
    const browser = await getBrowser(isHeadlessBrowser)
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 800 });

    const parsedCookies = cookiesString ? JSON.parse(cookiesString) : '';
    if (parsedCookies.length !== 0) {
      for (let cookie of parsedCookies) {
        await page.setCookie(cookie)
      }
    } else {
      await page.goto(instagramUrl, { waitUntil: 'load', timeout: 30000 });
      await page.waitForSelector('#loginForm');
      await page.type('input[name=username]', userName);
      await page.type('input[name=password]', password);
      await page.click('button[type=submit]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      await page.goto(profile, { waitUntil: 'load', timeout: 30000 });
      const cookiesObject = await page.cookies()
      await _fs.writeFile(cookiesFilePath, JSON.stringify(cookiesObject))
    }

    await page.goto(promoUrl, { waitUntil: 'load', timeout: 30000 });
    console.log('Prom page')

    try {
      let batchNumber = 0;
      while (remainingFriends.length) {
        const currentUrl = page.url();
        if (currentUrl != promoUrl) throw new Error('Out of the promo page')

        if (batchNumber == BATCH_NUMBER) {
          batchNumber = 0
          const timeOut = getBatchPostsTimeout();
          console.log(`Long pause for: ${(timeOut / 60000)} minutes`)
          await _fs.writeFile(remainingFriendsFilePath, JSON.stringify(remainingFriends))
          await page.waitForTimeout(timeOut)
        }

        const friend1 = remainingFriends.pop()
        const friend2 = remainingFriends.pop()
        await page.type('article form textarea', `@${friend1.profile} @${friend2.profile}`);
        await page.click('article form button[type=submit]');

        console.log('Remain: ', remainingFriends.length)
        console.log(`post with:  @${friend1.profile} @${friend2.profile}\n`)

        batchNumber++

        await _fs.writeFile(remainingFriendsFilePath, JSON.stringify(remainingFriends))
        await page.waitForTimeout(getBetweenPostsTimeout())
      }
      await browser.close()
    } catch (error) {
      console.log(error)

      await browser.close()

      await _fs.writeFile('./erros.log', JSON.stringify(error))
      await _fs.writeFile(remainingFriendsFilePath, JSON.stringify(remainingFriends))
      process.exit(1)
    }
  })()


} catch (error) {
  console.log(error)
}

