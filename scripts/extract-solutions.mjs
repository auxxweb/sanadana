import fs from "fs";

const raw = fs.readFileSync(
  "C:/Users/Hello Systems/.cursor/projects/c-Users-Hello-Systems-Documents-sanadana-herbals-sanadana/agent-transcripts/0e60e0fe-4cd2-4b06-8e45-a03ad7f63d7a/0e60e0fe-4cd2-4b06-8e45-a03ad7f63d7a.jsonl",
  "utf8"
);

const key = "solution-product-card__inner";
let last = -1;
let p = 0;
while ((p = raw.indexOf(key, p + 1)) !== -1) last = p;

if (last < 0) {
  console.error("not found");
  process.exit(1);
}

const start = raw.lastIndexOf("our-solutions-carousel", last - 80000);
const end = raw.indexOf("<!-- our commitment-section", last);
const chunk = raw
  .slice(start > 0 ? start - 200 : last - 5000, end > 0 ? end : last + 50000)
  .replace(/\\n/g, "\n")
  .replace(/\\"/g, '"');

fs.writeFileSync("scripts/recovery/solutions-chunk.txt", chunk);
console.log("wrote", chunk.length, "start", start, "end", end);
