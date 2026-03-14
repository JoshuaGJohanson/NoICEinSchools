module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("**/*.jpg");
  eleventyConfig.addPassthroughCopy("**/*.png");
  eleventyConfig.addPassthroughCopy("**/*.gif");
  eleventyConfig.addPassthroughCopy("**/*.svg");

  // Add filters
  eleventyConfig.addFilter("relative_url", function(url) {
    // Handle undefined, null, or empty values
    if (!url) {
      return "";
    }
    // Return the URL as-is - let pathPrefix handle the base
    return url;
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      layouts: "_layouts",
      output: "_site"
    },
    // Remove pathPrefix for Cloudflare Pages - it serves from root
    // If serving on GitHub Pages with /NoICEinSchools/ baseurl, add it back
    pathPrefix: process.env.ENVIRONMENT === 'cloudflare' ? "" : "/NoICEinSchools/",
    templateFormats: ["html", "md", "njk"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
