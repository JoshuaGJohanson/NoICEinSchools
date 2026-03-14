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
    // Return the URL as-is
    return url;
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      layouts: "_layouts",
      output: "_site"
    },
    // No pathPrefix - let Cloudflare serve from root
    templateFormats: ["html", "md", "njk"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
