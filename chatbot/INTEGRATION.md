# Sanadana Herbal AI Practitioner – Integration & Hosting

## 1. Integrate on Existing Website (sanadanaherbals.com)

Add these two lines before `</body>` on every page where the chatbot should appear:

```html
<link rel="stylesheet" href="/chatbot/chatbot.css">
<script src="/chatbot/chatbot.js"></script>
```

If the chatbot folder is at the site root:

```html
<link rel="stylesheet" href="https://sanadanaherbals.com/chatbot/chatbot.css">
<script src="https://sanadanaherbals.com/chatbot/chatbot.js"></script>
```

Place the three files on your server in a folder named `chatbot`:

- `chatbot/chatbot.css`
- `chatbot/chatbot.js`
- `chatbot/index.html` (optional; only for a standalone demo page)

No other HTML is required. The script creates the floating button and chat window automatically.

---

## 2. How to Host

**Option A – Same domain as main site**  
Upload the `chatbot` folder to your web server (e.g. via FTP/cPanel) so that:

- `https://sanadanaherbals.com/chatbot/chatbot.css` is reachable  
- `https://sanadanaherbals.com/chatbot/chatbot.js` is reachable  

Then add the link and script tags from section 1 to your existing pages.

**Option B – Subdomain or separate path**  
Host the same files under a subdomain (e.g. `chat.sanadanaherbals.com`) or another path. Use that base URL in the `href` and `src` of the link and script tags.

**Option C – CDN**  
Upload `chatbot.css` and `chatbot.js` to your CDN and reference the CDN URLs in the link and script tags.

---

## 3. Insert Script Tag on Shopify Theme

1. In Shopify Admin: **Online Store → Themes → Actions → Edit code**.
2. Open the theme file that wraps all pages (usually `theme.liquid`).
3. Find the closing `</body>` tag.
4. Just **before** `</body>`, add:

```html
<link rel="stylesheet" href="{{ 'chatbot.css' | asset_url }}">
<script src="{{ 'chatbot.js' | asset_url }}" defer></script>
```

4b. **Add the asset files:**  
- **Assets → Add a new asset** (or upload):  
  - Upload or create `chatbot.css` (paste in the CSS content).  
  - Upload or create `chatbot.js` (paste in the JS content).  

If you host the files elsewhere (e.g. your main site), use absolute URLs instead:

```html
<link rel="stylesheet" href="https://sanadanaherbals.com/chatbot/chatbot.css">
<script src="https://sanadanaherbals.com/chatbot/chatbot.js" defer></script>
```

5. Save. The chatbot will appear on all store pages that use that layout.

---

## 4. Optional: OpenAI API

To enable AI fallback when no product matches:

1. In `chatbot.js`, uncomment the block that defines `OPENAI_API_KEY` and the `getOpenAIReply` function.
2. Replace `"YOUR_API_KEY_HERE"` with your OpenAI API key.
3. In `getReply()`, uncomment the line that calls `getOpenAIReply` and handle the async flow (e.g. use async/await and keep the typing indicator until the request completes).

Keep the API key server-side in production (e.g. use a small backend proxy that adds the key) so it is not exposed in the browser.

---

## 5. File Checklist

| File           | Purpose                          |
|----------------|----------------------------------|
| `chatbot.css`  | Styles for widget and chat UI    |
| `chatbot.js`   | Logic, product DB, message flow  |
| `index.html`   | Optional standalone demo page    |
| `INTEGRATION.md` | This guide                     |
