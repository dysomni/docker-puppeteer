const express   = require('express');
const puppeteer = require('puppeteer');
const morgan    = require('morgan');
const app       = express();
const PORT      = process.env.APP_PORT || 8084

app.use(morgan('combined'));
app.listen(PORT);
console.log(`Now listening on port ${PORT}`)

//* ------ *//
//* ROUTES *//
//* ------ *//

app.get('/screenshot', async (req, res) => {
    const {url} = req.query;
    const imageData = await Screenshot(url);
    res.set('Content-Type', 'image/jpeg');
    res.set('Content-Length', imageData.length);
    res.send(imageData);
});

app.get('/html', async (req, res) => {
  const {url} = req.query;
  const html = await Html(url);
  res.set('Content-Type', 'text/html');
  res.send(html);
});

//* ------------------- *//
//* PUPPETEER FUNCTIONS *//
//* ------------------- *//

async function RunOnPage(url, pageFunction) {
  const browser = await puppeteer.launch({
    headless: false,
    args: [ "--no-sandbox", "--disable-gpu" ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 3 })
  await page.goto(url, {
    timeout: 0,
    waitUntil: 'networkidle0',
  });
  await pageFunction(page)
  await page.close();
  await browser.close();
}

async function Screenshot(url) {
  var screenData
  await RunOnPage(url, async (page) => {
    screenData = await page.screenshot({encoding: 'binary', type: 'jpeg', quality: 30});
  })
  return screenData;
}

async function Html(url) {
  var html
  await RunOnPage(url, async (page) => {
    html = await page.evaluate(() => document.documentElement.outerHTML);
  })
  return html;
}