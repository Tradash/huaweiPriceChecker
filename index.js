const threads = require("worker_threads");
const path = require("path");

// const puppeteer = require("puppeteer");

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
  let data;
  try {
    data = Number.parseInt(x.match(numberPattern).join(""));
  } catch (e) {
    console.log("Ошибка- - ", typeof x, x, e.message);
    data = 0;
  }

  return data;
};

const urls1 = [
  {
    name: "Huawei P30 Pro Black",
    shops: [
      {
        shop: "mvideo.ru",
        url:
          "https://www.mvideo.ru/products/smartfon-huawei-p30-pro-black-vog-l29-30044981",
        color: null,
        priceDiv:
          "div.c-pdp-price > div.c-pdp-price__summary > div.c-pdp-price__offers > div.c-pdp-price__current.sel-product-tile-price",
        price: "39 990 ₽",
      },
      {
        shop: "shop.huawei.ru",
        url: "https://shop.huawei.ru/product/huawei-p30-pro",
        color:
          "div.color-circle[style='width: 25px;height: 25px;background: black; border-radius: 50%;']",
        price: "44 990 ₽",
      },
    ],
  },
  {
    name: "Huawei P30 Pro Aurora",
    shops: [
      {
        shop: "mvideo.ru",
        url:
          "https://www.mvideo.ru/products/smartfon-huawei-p30-pro-aurora-vog-l29-30043038",
        color: null,
        priceDiv:
          "div.c-pdp-price > div.c-pdp-price__summary > div.c-pdp-price__offers > div.c-pdp-price__current.sel-product-tile-price",
        price: "39 990 ₽",
      },
      {
        shop: "shop.huawei.ru",
        url: "https://shop.huawei.ru/product/huawei-p30-pro",
        color:
          "div.color-circle[style='width: 25px;height: 25px;background: #0d9ead; border-radius: 50%;']",
        price: "44 990 ₽",
      },
    ],
  },
  {
    name: "Huawei P30 Pro Breathing Crystal",
    shops: [
      {
        shop: "mvideo.ru",
        url:
          "https://www.mvideo.ru/products/smartfon-huawei-p30-pro-breathing-crystal-vog-l29-30043039",
        color: null,
        priceDiv:
          "div.c-pdp-price > div.c-pdp-price__summary > div.c-pdp-price__offers > div.c-pdp-price__current.sel-product-tile-price",
        price: "39 990 ₽",
      },
      {
        shop: "shop.huawei.ru",
        url: "https://shop.huawei.ru/product/huawei-p30-pro",
        color:
          "div.color-circle[style='width: 25px;height: 25px;background: #bdf1ff; border-radius: 50%;']",
        price: "44 990 ₽",
      },
    ],
  },
  {
    name: "Huawei P30 Aurora",
    shops: [
      {
        shop: "mvideo.ru",
        url:
          "https://www.mvideo.ru/products/smartfon-huawei-p30-aurora-ele-l29-30043036",
        color: null,
        priceDiv:
          "div.c-pdp-price > div.c-pdp-price__summary > div.c-pdp-price__offers > div.c-pdp-price__current.sel-product-tile-price",
        price: "29 990 ₽",
      },
      {
        shop: "shop.huawei.ru",
        url: "https://shop.huawei.ru/product/huawei-p30",
        color:
          "div.color-circle[style='width: 25px;height: 25px;background: #0d9ead; border-radius: 50%;']",
        price: "29 990 ₽",
      },
    ],
  },
  {
    name: "Huawei P30 Breathing Crystal",
    shops: [
      {
        shop: "mvideo.ru",
        url:
          "https://www.mvideo.ru/products/smartfon-huawei-p30-breathing-crystal-ele-l29-30043037",
        color: null,
        priceDiv:
          "div.c-pdp-price > div.c-pdp-price__summary > div.c-pdp-price__offers > div.c-pdp-price__current.sel-product-tile-price",
        price: "29 990 ₽",
      },
      {
        shop: "shop.huawei.ru",
        url: "https://shop.huawei.ru/product/huawei-p30",
        color:
          "div.color-circle[style='width: 25px;height: 25px;background: #bdf1ff; border-radius: 50%;']",
        price: "29 990 ₽",
      },
    ],
  },
];

const priceCrawler = async () => {
  let activeWorker = 0;
  let rez = [];
  for (let i = 0; i < urls1.length; i++) {
    rez[urls1[i].name] = {};
    for (let j = 0; j < urls1[i].shops.length; j++) {
      activeWorker++;
      const newWorker = new threads.Worker(
        path.join(__dirname, "./worker.js"),
        {
          workerData: urls1[i].shops[j],
        }
      );
      newWorker.on("message", async (data) => {
        activeWorker--;
        rez[urls1[i].name][urls1[i].shops[j].shop] =
          data === null ? "Нет в наличии" : toNumber(data);
        await delay(500);
        await newWorker.terminate();
      });
      newWorker.on("error", async (data) => {
        activeWorker--;
        rez[urls1[i].name][urls1[i].shops[j].shop] = "Ошибка";
        await delay(500);
        await newWorker.terminate();
      });
    }
  }
  while (activeWorker !== 0) {
    await delay(500);
  }
  console.log("");
  console.table(rez);
};
console.log("Запущено в ", new Date().toLocaleString());
setInterval(() => {
  console.log(
    new Date().toLocaleString(),
    "-------------------------------------------------------------------"
  );
  priceCrawler();
}, 10 * 60 * 1000);
