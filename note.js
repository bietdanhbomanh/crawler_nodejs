options = new chrome.Options();
options.addArguments('headless'); // note: without dashes
options.addArguments('disable-gpu');

(async function example() {
    let driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
    try {
        await driver.get('https://www.flashscore.com');
        await driver.findElement(By.css('.filters__group .filters__tab:nth-child(2)')).click();

        const page = await driver.findElement(By.css('html')).getAttribute('innerHTML');
        const $ = cheerio.load(page);
        const matchs = $('.event__match--live');
        matchs.each(function () {
            const id = $(this).attr('id');
            const home = $(this).find('.event__participant--home').html();
            const away = $(this).find('.event__participant--away').html();
        });

        await driver.wait(until.titleIs('wait'));
    } finally {
        await driver.quit();
    }
})();
