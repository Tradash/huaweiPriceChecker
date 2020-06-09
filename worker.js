const threads = require("worker_threads");
const puppeteer = require("puppeteer");
const { parentPort } = threads;
// const { delay } = require("index");

const delay = async (delayInms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
};

const width = 1920;
const height = 1080;

const data = {
  shop: threads.workerData.shop,
  url: threads.workerData.url,
  color: threads.workerData.color,
  priceDiv: threads.workerData.priceDiv,
};

const sendResponse = (x) => {
  parentPort.postMessage(x);
};

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
    // const aUrls = urls[i];
    const context = browser.defaultBrowserContext();
    const startTime = new Date().getTime();
    page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.setDefaultNavigationTimeout(0);
    let flag = true;
    // if (i === 0 || urls[i - 1].url !== urls[i].url) {
    await context.overridePermissions(data.url, ["notifications"]);
    await page.goto(data.url, { waitUntil: "networkidle2" });
    // }
    // console.log("Страница загружена");
    if (data.shop === "shop.huawei.ru") {
      if (data.color) {
        await page.evaluate((urls) => {
          document
            .querySelector(urls)
            .scrollIntoView({ block: "center", behavior: "smooth" });
          // document.scrollBy(0, -90);
        }, data.color);
        await page.waitForSelector(data.color, {
          timeout: 5000,
        });
        await delay(1000);
        await page.click(data.color);
        // console.log("Выбран цвет аппарата");
      }
      await delay(500);
      page
        .waitForSelector("span.stock-out", {
          timeout: 5000,
        })
        .then(() => {
          sendResponse(null);
          // console.log(
          //   "\x1b[36m",
          //   new Date().toLocaleString(),
          //   new Date().getTime() - startTime,
          //   data.shop,
          //   data.name,
          //   `Нет в наличии`,
          //   "\x1b[0m"
          // );
          // flag = false;
          // browser.close();
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
          sendResponse(nd);
          // let colorT = "\x1b[0m";
          // if (toNumber(nd) < toNumber(aUrls.price)) colorT = "\x1b[33m";
          // console.log(
          //   "\x1b[0m",
          //   new Date().toLocaleString(),
          //   new Date().getTime() - startTime,
          //   data.shop,
          //   data.name,
          //   "Есть в наличии, Стоимость:",
          //   colorT,
          //   nd,
          //   "\x1b[0m"
          // );
          // browser.close();
        });
    }
    if (data.shop === "mvideo.ru") {
      await page
        .waitForSelector(data.priceDiv, {
          timeout: 5000,
        })
        .then(async () => {
          const nd = await page.$eval(data.priceDiv, (elem) => elem.innerText);
          sendResponse(nd);
          // let colorT = "\x1b[0m";
          // if (toNumber(nd) < toNumber(aUrls.price)) colorT = "\x1b[33m";
          // console.log(
          //   "\x1b[0m",
          //   new Date().toLocaleString(),
          //   new Date().getTime() - startTime,
          //   aUrls.shop,
          //   aUrls.name,
          //   "Есть в наличии, Стоимость:",
          //   colorT,
          //   nd,
          //   "\x1b[0m"
          // );
        })
        .catch(() => {
          sendResponse(null);
          // console.log(
          //   "\x1b[36m",
          //   new Date().toLocaleString(),
          //   new Date().getTime() - startTime,
          //   aUrls.shop,
          //   aUrls.name,
          //   `Нет в наличии`,
          //   "\x1b[0m"
          // );
        });
    }
    // while (flag) {

    // }
  })
  .catch((e) => console.log(" Все упало", e));
// await delay(2000);
