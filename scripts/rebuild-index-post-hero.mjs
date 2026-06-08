import fs from "fs";
import path from "path";

const root = path.resolve(".");
const indexPath = path.join(root, "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const partialPath = path.join(root, "assets/partials/home-post-hero.html");
const partial = fs.readFileSync(partialPath, "utf8");

const cssLinks = [
  "herbal-trust-strip.css",
  "about-sanadana-premium.css",
  "our-solutions-products.css",
  "testimonial-premium.css",
  "blog-insights-premium.css",
  "instagram-premium.css",
  "footer-premium.css",
  "site-premium.css",
];

for (const file of cssLinks) {
  const link = `<link href="assets/css/module-css/${file}" rel="stylesheet">`;
  if (!html.includes(link)) {
    html = html.replace(
      '<link href="assets/css/responsive.css" rel="stylesheet">',
      `${link}\n<link href="assets/css/responsive.css" rel="stylesheet">`
    );
  }
}

html = html.replace(/\.\/assets\/images\/logo-sandan-new-2\.png/g, "./assets/images/sanadana-header-logo.png");

const heroEnd = html.indexOf("<!-- banner-section end -->");
if (heroEnd < 0) throw new Error("hero end marker not found");
const heroEndPos = heroEnd + "<!-- banner-section end -->".length;

const footerStart = html.indexOf("<!-- main-footer -->");
if (footerStart < 0) throw new Error("footer start not found");

const footerEnd = html.indexOf("<!-- main-footer end -->");
if (footerEnd < 0) throw new Error("footer end not found");
const footerEndPos = footerEnd + "<!-- main-footer end -->".length;

html = html.slice(0, heroEndPos) + "\n\n" + partial + "\n\n" + html.slice(footerEndPos);

const scriptTags = [
  '<script src="assets/js/our-solutions-carousel.js" defer></script>',
  '<script src="assets/js/testimonial-premium.js" defer></script>',
  '<script src="assets/js/footer-premium.js" defer></script>',
];

for (const tag of scriptTags) {
  if (!html.includes(tag)) {
    html = html.replace(
      '<script src="assets/js/script.js"',
      `${tag}\n    <script src="assets/js/script.js"`
    );
  }
}

fs.writeFileSync(indexPath, html);
console.log("Rebuilt index.html post-hero sections (" + partial.length + " chars)");
