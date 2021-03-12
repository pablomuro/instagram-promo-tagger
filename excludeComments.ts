import fs from 'fs'
import dotenv from 'dotenv'
import { getBrowser } from './browser'
import { getBetweenPostsTimeout, getBatchPostsTimeout } from './utils'
dotenv.config()

const _fs = fs.promises

const remainingFriendsFilePath = './json_files/remainingFriends.json';
const cookiesFilePath = './json_files/cookies.json';

try {
  if (!process.env.PROFILE) throw new Error('Missing PROFILE')

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

const remainingFriends: any = JSON.parse(fs.readFileSync(remainingFriendsFilePath).toString())
const cookiesString = fs.readFileSync(cookiesFilePath).toString().replace("\n", '');


const foto = 'https://www.instagram.com/p/CIdWqySnNmI/'

try {
  (async () => {
    const browser = await getBrowser(isHeadlessBrowser)
    const page = await browser.newPage();
    // await page.setViewport({ width: 1366, height: 800 });

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

    await page.goto(foto, { waitUntil: 'load', timeout: 30000 });
    console.log('Prom page')

    const plusButtonEl = 'article div div ul button'
    try {
      let plusButton = await page.$(plusButtonEl);
      while (plusButton) {

        await page.waitForTimeout(500)
        const listOfUl = await page.$$('article div ul ul');
        if (listOfUl) {
          const dots = await listOfUl[0].$('button[type="button"]')
          dots?.evaluate(el => el.click())
          await page.waitForTimeout(500)
          let exclude = await page.$('div[role="dialog"] div button:nth-of-type(2)')
          while (exclude) {
            await page.waitForTimeout(200)
            await exclude.click()
            await page.waitForTimeout(200)
            exclude = await page.$('div[role="dialog"] div button:nth-of-type(2)')
          }

        }
        await page.click(plusButtonEl);
        plusButton = await page.$(plusButtonEl);
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

