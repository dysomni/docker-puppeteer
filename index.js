// server.js
const express = require('express');
const puppeteer = require('puppeteer');
var morgan = require('morgan');

const app = express();
app.use(morgan('combined'));

app.get('/screenshot', async (req, res) => {
    const {url} = req.query;
    if (!url || url.length === 0) {
        return res.json({error: 'url query parameter is required'});
    }

    const imageData = await Screenshot(url);

    res.set('Content-Type', 'image/jpeg');
    res.set('Content-Length', imageData.length);
    res.send(imageData);
});

app.get('/html', async (req, res) => {
  const {url} = req.query;
  if (!url || url.length === 0) {
      return res.json({error: 'url query parameter is required'});
  }

  const html = await Html(url);

  res.set('Content-Type', 'text/html');
  res.send(html);
});

const PORT = process.env.PORT || 8084
app.listen(PORT);
console.log(`Now listening on port ${PORT}`)

async function Screenshot(url) {
   const browser = await puppeteer.launch({
       headless: false,
       args: [
       "--no-sandbox",
       "--disable-gpu",
       ]
   });

    const page = await browser.newPage();

    await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 3 })

    await page.goto(url, {
      timeout: 0,
      waitUntil: 'networkidle0',
    });

    const screenData = await page.screenshot({encoding: 'binary', type: 'jpeg', quality: 30});

    await page.close();
    await browser.close();

    // Binary data of an image
    return screenData;
}

async function Html(url) {
  const browser = await puppeteer.launch({
      headless: false,
      args: [
      "--no-sandbox",
      "--disable-gpu",
      ]
  });

   const page = await browser.newPage();

   await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 3 })

   await page.goto(url, {
     timeout: 0,
     waitUntil: 'networkidle0',
   });

   let html = await page.evaluate(() => document.documentElement.outerHTML);

   await page.close();
   await browser.close();

   // Binary data of an image
   return html;
}