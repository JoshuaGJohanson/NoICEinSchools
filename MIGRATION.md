# No ICE in Schools - Jekyll to Eleventy Migration

## Changes Made

This site has been migrated from Jekyll (Ruby-based static site generator) to Eleventy (JavaScript-based static site generator).

### Key Files Changed/Created:

1. **`.eleventy.js`** - New Eleventy configuration file that handles:
   - Pass-through copying of static assets
   - Custom filter for `relative_url` to handle the GitHub Pages baseurl
   - Template engine configuration for Nunjucks/Liquid syntax

2. **`package.json`** - Updated with:
   - Eleventy 3.1.2 as a dependency
   - Build scripts: `npm run build` and `npm start` for local development

3. **`.eleventyignore`** - New file to specify which files Eleventy should ignore

4. **`.github/workflows/jekyll.yml`** - Renamed to use Eleventy build process
   - Replaced Ruby setup with Node.js setup
   - Changed build command from `bundle exec jekyll build` to `npm run build`

5. **`_layouts/default.html`** - Updated for Eleventy compatibility:
   - Changed `page.title` to `title` (Eleventy's data structure)
   - Changed `site.title` to hardcoded value
   - Updated include syntax to use quoted filenames

### No Changes Needed:

- HTML files in `/pages` directory
- CSS files in `/css` directory
- JavaScript files in `/assets/js` directory
- Images in `/assets/images` directory
- Includes in `/_includes/` directory (Liquid syntax compatible with Eleventy)

## Running Locally

Instead of `bundle exec jekyll serve`:

```bash
npm start
```

Or to build once:

```bash
npm run build
```

## Deployment

GitHub Actions workflow automatically builds and deploys to GitHub Pages when pushing to the `main` branch.

## Notes

- Eleventy uses Nunjucks as the default templating engine, which is compatible with Liquid syntax
- The `relative_url` filter is custom-implemented in `.eleventy.js` to handle the GitHub Pages baseurl
- All existing template syntax (Liquid filters, includes, etc.) remains compatible
