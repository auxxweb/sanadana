import fs from "fs";
import path from "path";

const raw = fs.readFileSync(
  "C:/Users/Hello Systems/.cursor/projects/c-Users-Hello-Systems-Documents-sanadana-herbals-sanadana/agent-transcripts/0e60e0fe-4cd2-4b06-8e45-a03ad7f63d7a/0e60e0fe-4cd2-4b06-8e45-a03ad7f63d7a.jsonl",
  "utf8"
);
const out = path.resolve("scripts/recovery");

function unescapeJson(s) {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function extractBetween(startMarker, endMarker, label) {
  const starts = [];
  let p = 0;
  while ((p = raw.indexOf(startMarker, p)) !== -1) {
    starts.push(p);
    p += 1;
  }
  for (let i = starts.length - 1; i >= 0; i--) {
    const s = starts[i];
    const e = raw.indexOf(endMarker, s + startMarker.length);
    if (e > s && e - s < 120000) {
      let chunk = raw.slice(s, e + endMarker.length);
      chunk = unescapeJson(chunk);
      if (chunk.includes("<section") || chunk.includes("<!--")) {
        fs.writeFileSync(path.join(out, `${label}.html`), chunk);
        console.log(label, "len", chunk.length, "at", s);
        return chunk;
      }
    }
  }
  console.log("fail", label);
  return null;
}

fs.mkdirSync(out, { recursive: true });

extractBetween(
  "<!-- our-category-section -->",
  "<!-- our-category-section end -->",
  "category-final"
);
extractBetween(
  "<!-- about-section",
  "<!-- about-section end -->",
  "about-final"
);
extractBetween(
  "<!-- our herbal-solutions-section -->",
  "<!-- our herbal-solutions-section end -->",
  "solutions-final"
);
extractBetween(
  "<!-- testimonial-section -->",
  "<!-- testimonial-section end -->",
  "testimonial-final"
);
extractBetween("<!-- news-section -->", "<!-- news-section end -->", "news-final");
extractBetween(
  "<!-- instagram-section -->",
  "<!-- instagram-section end -->",
  "instagram-final"
);
extractBetween(
  '<footer class="main-footer footer-premium"',
  "<!-- main-footer end -->",
  "footer-final"
);
