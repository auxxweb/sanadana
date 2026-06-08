import fs from "fs";
import { execSync } from "child_process";

const transcriptPath =
  "C:/Users/Hello Systems/.cursor/projects/c-Users-Hello-Systems-Documents-sanadana-herbals-sanadana/agent-transcripts/0e60e0fe-4cd2-4b06-8e45-a03ad7f63d7a/0e60e0fe-4cd2-4b06-8e45-a03ad7f63d7a.jsonl";
const lines = fs.readFileSync(transcriptPath, "utf8").split("\n");
const CUTOFF = 918;

function applyPatches(html) {
  let applied = 0;
  let failed = 0;
  for (let i = 0; i < CUTOFF; i++) {
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
      const p = (inp.path || "").replace(/\\/g, "/");
      if (!p.includes("index.html")) continue;
      const oldS = inp.old_string;
      const newS = inp.new_string;
      if (!oldS || !newS || oldS === newS) continue;
      if (!html.includes(oldS)) {
        failed++;
        continue;
      }
      html = html.replace(oldS, newS);
      applied++;
    }
  }
  console.log("patches applied", applied, "failed", failed);
  return html;
}

let base = execSync("git show HEAD:index.html", { encoding: "utf8" });
let patched = applyPatches(base);

const heroEnd =
  patched.indexOf("<!-- banner-section end -->") + "<!-- banner-section end -->".length;
const footerEnd =
  patched.indexOf("<!-- main-footer end -->") + "<!-- main-footer end -->".length;

if (heroEnd < 50 || footerEnd < heroEnd) {
  console.error("markers missing", { heroEnd, footerEnd });
  process.exit(1);
}

const postHero = patched.slice(heroEnd, footerEnd).trim();
fs.mkdirSync("assets/partials", { recursive: true });
fs.writeFileSync("assets/partials/home-post-hero-pre-apple.html", postHero);
console.log("Wrote pre-apple post-hero", postHero.length);
console.log({
  herbal: postHero.includes("herbal-trust"),
  blogInsights: postHero.includes("blog-insights"),
  newsCarousel: postHero.includes("three-item-carousel"),
  solutions: postHero.includes("our-solutions-carousel"),
  testimonialPremium: postHero.includes("testimonial-premium"),
  footerPremium: postHero.includes("footer-premium"),
  sitePremiumBody: patched.includes('class="site-premium"'),
});
