import fs from "fs";
import { execSync } from "child_process";

const transcriptPath =
  "C:/Users/Hello Systems/.cursor/projects/c-Users-Hello-Systems-Documents-sanadana-herbals-sanadana/agent-transcripts/0e60e0fe-4cd2-4b06-8e45-a03ad7f63d7a/0e60e0fe-4cd2-4b06-8e45-a03ad7f63d7a.jsonl";
const lines = fs.readFileSync(transcriptPath, "utf8").split("\n");
const START = 580;
const END = 918;

let postHero = fs.readFileSync("assets/partials/home-post-hero-pre-apple.html", "utf8");

for (let i = START; i < END; i++) {
  const line = lines[i];
  if (!line.includes("index.html")) continue;
  let j;
  try {
    j = JSON.parse(line);
  } catch {
    continue;
  }
  const content = j.message?.content;
  if (!Array.isArray(content)) continue;
  for (const c of content) {
    if (c.type !== "tool_use" || c.name !== "StrReplace") continue;
    const inp = c.input || {};
    if (!(inp.path || "").includes("index.html")) continue;
    const oldS = inp.old_string;
    const newS = inp.new_string;
    if (!oldS || !newS || oldS === newS) continue;
    if (postHero.includes(oldS) || fs.readFileSync("index.html", "utf8").includes(oldS)) {
      if (postHero.includes(oldS)) {
        postHero = postHero.replace(oldS, newS);
      }
    }
  }
}

// Footer premium from about.html (sitewide standard before Apple prompt)
const about = fs.readFileSync("about.html", "utf8");
const footerPremium = about.match(
  /<!-- main-footer -->[\s\S]*?<!-- main-footer end -->/
)?.[0];
if (footerPremium) {
  postHero = postHero.replace(
    /<!-- main-footer -->[\s\S]*?<!-- main-footer end -->/,
    footerPremium
  );
}

// Instagram premium from about.html
const instaPremium = about.match(
  /<!-- instagram-section -->[\s\S]*?<!-- instagram-section end -->/
)?.[0];
if (instaPremium) {
  postHero = postHero.replace(
    /<!-- instagram-section -->[\s\S]*?<!-- instagram-section end -->/,
    instaPremium
  );
}

postHero = postHero
  .replace(/<\/?motion\b[^>]*>/gi, (t) => t.replace(/motion/gi, "div"))
  .replace(/<motion>/gi, "<motion>")
  .replace(/<\/motion>/gi, "</motion>");

// Fix motion->motion typos
postHero = postHero.replace(/<\/?motion\b[^>]*>/gi, (tag) =>
  tag.replace(/motion/gi, "div")
);

const index = fs.readFileSync("index.html", "utf8");
const heroEnd =
  index.indexOf("<!-- banner-section end -->") + "<!-- banner-section end -->".length;
const footerEnd =
  index.indexOf("<!-- main-footer end -->") + "<!-- main-footer end -->".length;

let out =
  index.slice(0, heroEnd) + "\n\n" + postHero.trim() + "\n\n" + index.slice(footerEnd);

// Head links: ensure premium CSS (same as before Apple era)
const css = [
  "herbal-trust-strip.css",
  "about-sanadana-premium.css",
  "our-solutions-products.css",
  "testimonial-premium.css",
  "blog-insights-premium.css",
  "instagram-premium.css",
  "footer-premium.css",
  "site-premium.css",
];
for (const file of css) {
  const link = `<link href="assets/css/module-css/${file}" rel="stylesheet">`;
  if (!out.includes(link)) {
    out = out.replace(
      '<link href="assets/css/responsive.css" rel="stylesheet">',
      `${link}\n<link href="assets/css/responsive.css" rel="stylesheet">`
    );
  }
}

if (!out.includes('class="site-premium"')) {
  out = out.replace("<body>", '<body class="site-premium">');
}

const scripts = [
  '<script src="assets/js/our-solutions-carousel.js" defer></script>',
  '<script src="assets/js/testimonial-premium.js" defer></script>',
  '<script src="assets/js/footer-premium.js" defer></script>',
];
for (const tag of scripts) {
  if (!out.includes(tag)) {
    out = out.replace(
      '<script src="assets/js/script.js"',
      `${tag}\n    <script src="assets/js/script.js"`
    );
  }
}

fs.writeFileSync("index.html", out);
console.log("Merged pre-apple post-hero into index.html");
console.log({
  blogInsights: postHero.includes("blog-insights"),
  footerPremium: postHero.includes("footer-premium"),
  instaPremium: postHero.includes("instagram-premium"),
});
