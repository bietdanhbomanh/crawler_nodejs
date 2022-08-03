import { Builder, Browser, By, Key, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import mysql from 'mysql';
import cheerio from 'cheerio';
import https from 'https';
import fs from 'fs';

import config from './config';

const options = new chrome.Options();
options.addArguments('headless');

const database = mysql.createConnection(config.database);

database.connect(function (err) {
    if (err) {
        throw err;
    }
    console.log('DB Connected!, crawl start');
});

(async function example() {
    let driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
    try {
        await driver.get(config.crawlURL);
        await driver.findElement(By.css('.filters__group .filters__tab:nth-child(2)')).click();

        const page = await driver.findElement(By.css('html')).getAttribute('innerHTML');
        const $ = cheerio.load(page);
        const matchs = $('.event__match--live');
        await matchs.each(function () {
            const match = $(this);
            const match_id = match.attr('id').replace('g_1_', '');
            const home = match.find('.event__participant--home').text().trim();
            const away = match.find('.event__participant--away').text().trim();

            const logo_home = match.find('.event__logo--home').attr('src')
                ? match.find('.event__logo--home').attr('src').split('/').slice(-1)[0]
                : '';

            const logo_away = match.find('.event__logo--away').attr('src')
                ? match.find('.event__logo--away').attr('src').split('/').slice(-1)[0]
                : '';

            const pathImg = config.crawlURL + match.find('.event__logo--home').attr('src');
            crawlFile('logo/', logo_home, pathImg);
            crawlFile('logo/', logo_away, pathImg);

            const ecapsed = match.find('.event__stage--block').text().trim();

            const detail = JSON.stringify({ home, away, logo_home, logo_away, ecapsed });

            addRow('match_detail', { match_id, detail });
        });

        driver.quit();
    } finally {
        await driver.quit();
    }
})();

function addRow(table, objectValue) {
    const keys = Object.keys(objectValue).join();
    const values = Object.values(objectValue)
        .map(function (value) {
            return `'${value}'`;
        })
        .join();

    const sql = `INSERT INTO ${table} (${keys}) VALUES (${values})`;
    database.query(sql, function (error, result) {
        if (error) {
            console.log(error);
        }
        console.log('Write db Success');
    });
}

function crawlFile(pathFolderSave, fileName, fileURL) {
    if (fileName) {
        const path = pathFolderSave + fileName;

        if (!fs.existsSync(path)) {
            https.get(fileURL, function (res) {
                const file = fs.createWriteStream(path);
                res.pipe(file);
                file.on('finish', function () {
                    file.close(function () {
                        console.log('Download success');
                    });
                });
            });
        } else {
            console.log('File exist');
        }
    }
}
