import { Builder, Browser, By, Key, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import cheerio from 'cheerio';
import config from './config';

const options = new chrome.Options();
// options.addArguments('headless');

(async function example() {
    let driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
    try {
        await driver.get('http://www.google.com/ncr');
        // ép driver element thành element dom -> arguments[0]
        await driver.executeScript('console.log(arguments[0])', driver.findElement(By.name('q')));
        await driver.wait(until.titleIs('webdriver - Google Search'));
        after(() => driver.quit());
    } finally {
        await driver.quit();
    }
})();
