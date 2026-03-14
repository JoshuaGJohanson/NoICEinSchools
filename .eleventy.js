module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("CNAME");

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
    pathPrefix: "/NoICEinSchools/",
    templateFormats: ["html", "md", "njk"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
