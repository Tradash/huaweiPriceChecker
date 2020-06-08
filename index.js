const puppeteer = require("puppeteer");

const delay = async (delayInms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
};

// console.log("44 990 ₽".split(" "));

const toNumber = (x) => {
  const numberPattern = /\d+/g;
  return Number.parseInt(x.match(numberPattern).join(""));
};

// console.log(toNumber("44 990 ₽"));

const urls = [
  {
    name: "HUAWEI P30 PRO ЧЕРНЫЙ",
    url: "https://shop.huawei.ru/product/huawei-p30-pro",
    color:
      "div.color-circle[style='width: 25px;height: 25px;background: black; border-radius: 50%;']",
    price: "44 990 ₽",
  },
  {
    name: "HUAWEI P30 PRO СЕВЕРНОЕ СИЯНИЕ",
    url: "https://shop.huawei.ru/product/huawei-p30-pro",
    color:
      "div.color-circle[style='width: 25px;height: 25px;background: #0d9ead; border-radius: 50%;']",
    price: "44 990 ₽",
  },
  {
    name: "HUAWEI P30 PRO CВЕТЛО-ГОЛУБОЙ",
    url: "https://shop.huawei.ru/product/huawei-p30-pro",
    color:
      "div.color-circle[style='width: 25px;height: 25px;background: #bdf1ff; border-radius: 50%;']",
    price: "44 990 ₽",
  },
  {
    name: "HUAWEI P30 PRO ДЫМЧАТЫЙ ЛАВАНДОВЫЙ",
    url: "https://shop.huawei.ru/product/huawei-p30-pro",
    color:
      "div.color-circle[style='width: 25px;height: 25px;background: #a67d94; border-radius: 50%;']",
    price: "44 990 ₽",
  },
  {
    name: "HUAWEI P30 CВЕТЛО-ГОЛУБОЙ",
    url: "https://shop.huawei.ru/product/huawei-p30",
    color:
      "div.color-circle[style='width: 25px;height: 25px;background: #bdf1ff; border-radius: 50%;']",
    price: "29 990 ₽",
  },
  {
    name: "HUAWEI P30 СЕВЕРНОЕ СИЯНИЕ",
    url: "https://shop.huawei.ru/product/huawei-p30",
    color:
      "div.color-circle[style='width: 25px;height: 25px;background: #0d9ead; border-radius: 50%;']",
    price: "29 990 ₽",
  },
];

// document.querySelector("div.color-circle")

// "https://shop.huawei.ru/product/huawei-p30";

// let browser;
const width = 1920;
const height = 1080;
// console.log("11111");

const priceCrawler = async () => {
  // console.log("11112");
  for (let i = 0; i < urls.length; i++) {
    puppeteer
      .launch({
        headless: true,
        slowMo: 10,
        args: [
          `--window-size=${width},${height}`,
          "--disable-web-security",
          "--disable-features=IsolateOrigins,site-per-process",
        ],
      })
      .then(async (browser) => {
        let page;
        // console.log("11113");
        const aUrls = urls[i];
        const context = browser.defaultBrowserContext();
        const startTime = new Date().getTime();
        page = await browser.newPage();
        await page.setViewport({ width, height });
        await page.setDefaultNavigationTimeout(0);
        let flag = true;
        // if (i === 0 || urls[i - 1].url !== urls[i].url) {
        await context.overridePermissions(aUrls.url, ["notifications"]);
        await page.goto(aUrls.url, { waitUntil: "networkidle2" });
        // }
        // console.log("Страница загружена");
        if (aUrls.color) {
          await page.evaluate((urls) => {
            document
              .querySelector(urls)
              .scrollIntoView({ block: "center", behavior: "smooth" });
            // document.scrollBy(0, -90);
          }, aUrls.color);
          await page.waitForSelector(aUrls.color, {
            timeout: 5000,
          });
          await delay(1000);
          await page.click(aUrls.color);
          // console.log("Выбран цвет аппарата");
        }
        await delay(500);
        page
          .waitForSelector("span.stock-out", {
            timeout: 5000,
          })
          .then(() => {
            console.log(
              "\x1b[36m",
              new Date().toLocaleString(),
              new Date().getTime() - startTime,
              urls[i].name,
              `Нет в наличии`,
              "\x1b[0m"
            );
            flag = false;
            browser.close();
          })
          .catch(async () => {
            // console.log("Создание заказа");
            await page.waitForSelector("a.temp-cart-btn.btn_black_secondary", {
              timeout: 5000,
            });

            await page.evaluate(() => {
              document
                .querySelector("a.temp-cart-btn.btn_black_secondary")
                .scrollIntoView({ block: "center", behavior: "smooth" });
            });

            await page.click("a.temp-cart-btn.btn_black_secondary");

            await delay(500);
            await page.waitForSelector("b#new-cart-price.label-detail", {
              timeout: 5000,
            });

            await page.waitForSelector(
              "div.success-pro-detail > span.icon_close",
              {
                timeout: 5000,
              }
            );
            const nd = await page.$eval(
              "b#new-cart-price.label-detail",
              (elem) => elem.innerText
            );
            let colorT = "\x1b[0m";
            if (toNumber(nd) < toNumber(aUrls.price)) colorT = "\x1b[33m";
            console.log(
              "\x1b[0m",
              new Date().toLocaleString(),
              new Date().getTime() - startTime,
              urls[i].name,
              "Есть в наличии, Стоимость:",
              colorT,
              nd,
              "\x1b[0m"
            );
            browser.close();
          });

        // while (flag) {

        // }
      });
    await delay(2000);
  }
};
console.log("Запущено в ", new Date().toLocaleString());
setInterval(() => {
  priceCrawler().then(() =>
    console.log(
      "-------------------------------------------------------------------"
    )
  );
}, 30 * 60 * 1000);
