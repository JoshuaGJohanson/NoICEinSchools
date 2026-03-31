const fs = require("fs");
const path = require("path");

module.exports = function () {
  // Parse used image slugs from image_usage.txt
  const usageTxt = fs.readFileSync(
    path.join(__dirname, "images/image_usage.txt"),
    "utf8"
  );

  // Only read lines before the UNUSED IMAGES section
  const usedSection = usageTxt.split("UNUSED IMAGES")[0];
  const usedSlugs = new Set();
  for (const line of usedSection.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.endsWith(".jpg")) {
      usedSlugs.add(trimmed.replace(/\.jpg$/, ""));
    }
  }

  // Load attribution JSON only for used images
  const attrDir = path.join(__dirname, "images/attributions");
  return fs.readdirSync(attrDir)
    .filter(f => {
      const slug = f.replace(/_metadata\.json$/, "");
      return f.endsWith(".json") && usedSlugs.has(slug);
    })
    .map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(attrDir, f), "utf8"));
      return {
        title: data.title,
        photographer: data.attribution?.photographer?.name,
        profile_url: data.links?.photographer_profile,
        photo_url: data.links?.download_unsplash,
      };
    })
    .sort((a, b) => a.photographer?.localeCompare(b.photographer));
};
