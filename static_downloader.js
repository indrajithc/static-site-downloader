const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');
const { URL } = require('url');
const express = require('express');

const STATIC_DIR = path.join(__dirname, 'static_server_folder');
const LOCAL_SERVER_PORT = 3000;

async function downloadWebsite(targetUrl) {
  const { data: html } = await axios.get(targetUrl);
  const $ = cheerio.load(html);
  const baseUrl = new URL(targetUrl);

  // Save HTML path
  const htmlFilePath = path.join(STATIC_DIR, 'index.html');

  await fs.ensureDir(STATIC_DIR);

  // Find all linked CSS
  const cssLinks = $('link[rel="stylesheet"]');

  for (let i = 0; i < cssLinks.length; i++) {
    const linkTag = cssLinks[i];
    const cssHref = $(linkTag).attr('href');

    if (!cssHref) continue;

    const cssUrl = new URL(cssHref, baseUrl).href;
    const cssPath = new URL(cssUrl).pathname;
    const localCssPath = path.join(STATIC_DIR, cssPath);

    try {
      const { data: cssContent } = await axios.get(cssUrl);
      await fs.ensureDir(path.dirname(localCssPath));
      await fs.writeFile(localCssPath, cssContent, 'utf-8');

      // Update HTML to point to local CSS
      const localUrlPath = cssPath.startsWith('/') ? cssPath : `/${cssPath}`;
      $(linkTag).attr('href', localUrlPath);
    } catch (err) {
      console.error(`Failed to fetch CSS: ${cssUrl}`, err.message);
    }
  }

  // Write modified HTML
  await fs.writeFile(htmlFilePath, $.html(), 'utf-8');
  console.log('✅ Download complete and HTML updated.');
}

function startStaticServer() {
  const app = express();
  app.use(express.static(STATIC_DIR));

  app.listen(LOCAL_SERVER_PORT, () => {
    console.log(`🚀 Local server running at http://localhost:${LOCAL_SERVER_PORT}`);
  });
}

// Run it
(async () => {
  const inputUrl = process.argv[2];
  if (!inputUrl) {
    console.error('❌ Please provide a URL to download.');
    process.exit(1);
  }

  try {
    await downloadWebsite(inputUrl);
    startStaticServer();
  } catch (err) {
    console.error('💥 Error:', err.message);
  }
})();
