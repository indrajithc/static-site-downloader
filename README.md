# 🕸 Static Website Downloader & Local Server

This Node.js script downloads a web page and its linked CSS files, updates all CSS paths to point to local files, and starts a local server to serve the saved static content.

## ✅ Features

- Downloads a target website's HTML.
- Downloads all linked CSS files.
- Updates HTML to use local paths for CSS.
- Saves everything to a local `static_server_folder`.
- Starts a local web server to preview the saved site.

---

## 📦 Installation

Make sure you have **Node.js** installed.

Then install the required dependencies:

```bash
npm install axios cheerio express fs-extra path url
````

---

## 🚀 Usage

Run the script with a URL:

```bash
node static_downloader.js <website_url>
```

**Example:**

```bash
node static_downloader.js https://example.com
```

This will:

* Download the HTML and all CSS files from `https://example.com`
* Save everything into a local folder: `static_server_folder`
* Start a local web server on: `http://localhost:3000`

You can open this URL in your browser to view the downloaded page.

---

## 📂 Output Structure

```
static_server_folder/
├── index.html
├── css/
│   └── style.css
└── other folders (if CSS are nested)
```

The script preserves the directory structure of the downloaded CSS files.

---

## 🧩 TODO / Improvements

* Download and rewrite paths for JavaScript files.
* Download and handle images and font files.
* Handle CSS `url(...)` resources.
* Retry on failed downloads.

---

## 📃 License

MIT License. Use freely and modify as needed.

