const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs-extra");
const path = require("path");
const { URL } = require("url");
const express = require("express");

const STATIC_DIR = path.join(__dirname, "static_server_folder");
const LOCAL_SERVER_PORT = 3000;

async function downloadWebsite(targetUrl) {
  // Step 0: Clean up old folder
  await fs.remove(STATIC_DIR);
  await fs.ensureDir(STATIC_DIR);

  const { data: html } = await axios.get(targetUrl);
  const $ = cheerio.load(html);
  const baseUrl = new URL(targetUrl);

  // Save HTML path
  const htmlFilePath = path.join(STATIC_DIR, "index.html");

  await fs.ensureDir(STATIC_DIR);

  // Find all link tags with rel="stylesheet" or rel="preload" with as="style"
  const linkTags = $('link[rel="stylesheet"], link[rel="preload"][as="style"]');

  for (let i = 0; i < linkTags.length; i++) {
    const linkTag = linkTags[i];
    const href = $(linkTag).attr("href");

    if (!href) continue;

    const cssUrl = new URL(href, baseUrl).href;
    const cssPath = new URL(cssUrl).pathname;
    const localCssPath = path.join(STATIC_DIR, cssPath);

    try {
      const { data: cssContent } = await axios.get(cssUrl);
      await fs.ensureDir(path.dirname(localCssPath));
      await fs.writeFile(localCssPath, cssContent, "utf-8");

      // Update href in HTML to point to local version
      const localUrlPath = cssPath.startsWith("/") ? cssPath : `/${cssPath}`;
      $(linkTag).attr("href", localUrlPath);
    } catch (err) {
      console.error(`Failed to fetch CSS: ${cssUrl}`, err.message);
    }
  }

  // Write modified HTML
  await fs.writeFile(htmlFilePath, $.html(), "utf-8");
  console.log("✅ Download complete and HTML updated.");
}

function startStaticServer() {
  const app = express();
  app.use(express.static(STATIC_DIR));

  app.listen(LOCAL_SERVER_PORT, () => {
    console.log(
      `🚀 Local server running at http://localhost:${LOCAL_SERVER_PORT}`
    );
  });
}

// Run it
(async () => {
  const inputUrl = process.argv[2];
  if (!inputUrl) {
    console.error("❌ Please provide a URL to download.");
    process.exit(1);
  }

  try {
    await downloadWebsite(inputUrl);
    startStaticServer();
  } catch (err) {
    console.error("💥 Error:", err.message);
  }
})();
