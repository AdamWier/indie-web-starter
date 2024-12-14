const { DateTime } = require("luxon");
const markdownItAnchor = require("markdown-it-anchor");

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginNavigation = require("@11ty/eleventy-navigation");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

const pluginDrafts = require("./eleventy.config.drafts.js");
const pluginImages = require("./eleventy.config.images.js");

const dotenv = require('dotenv');

const eleventyGoogleFonts = require("eleventy-google-fonts");

const stripHtml = require('striptags');

var he = require('he');

const markdownItFootnote = require("markdown-it-footnote");
const markdownItEmoji = require("markdown-it-emoji").full;
const mdIterator = require('markdown-it-for-inline')
const readingTime = require('eleventy-plugin-reading-time');

/** @param {import('@11ty/eleventy').UserConfig} eleventyConfig */
module.exports = function(eleventyConfig) {
	dotenv.config()

	eleventyConfig.addPlugin(readingTime);

	eleventyConfig.addPlugin(eleventyGoogleFonts);
	
	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig.addPassthroughCopy({
		"./public/": "/",
		"./uploads/": "/",
		"./node_modules/prismjs/themes/prism-okaidia.css": "/css/prism-okaidia.css"
	});

	eleventyConfig.addFilter("base64", function(url) {
		return Buffer.from(url).toString('base64');
  });

  eleventyConfig.addFilter("excludeReplyTo", posts =>
	posts.filter( post =>!post.data["in-reply-to"])
  )

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch content images for the image pipeline.
	// eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

	// App plugins
	eleventyConfig.addPlugin(pluginDrafts);
	eleventyConfig.addPlugin(pluginImages);

	// Official plugins
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 }
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
	eleventyConfig.addPlugin(pluginBundle);

	eleventyConfig.addFilter("removeStatuses", string => string.replace("/users/donthatedontkill/statuses", "/@donthatedontkill"))
	
	eleventyConfig.addFilter("toLocaleTimeString", (date) => {
		date.setHours(date.getHours() + 2)
		return date.toLocaleTimeString()
	})

	eleventyConfig.addFilter('escapeQuotes', string => string.replace(/(?<!^)\"(?!$)/g, "\\\""))

	eleventyConfig.addFilter('decodeHtmlEntities', string => he.decode(string))

	// Filters
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
	});

	eleventyConfig.addFilter('htmlDateString', (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
	});

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if(!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if( n < 0 ) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	// Return all the tags used in a collection
	eleventyConfig.addFilter("getAllTags", collection => {
		let tagSet = new Set();
		for(let item of collection) {
			(item.data.tags || []).forEach(tag => tagSet.add(tag));
		}
		return Array.from(tagSet);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
	});

	eleventyConfig.addFilter('limit', (array, limit) => array.slice(0,limit))

	eleventyConfig.addFilter('removeHtml', (string) => stripHtml(string))

	eleventyConfig.addFilter('tagify', tags => tags.map(tag => `#${tag}`).join(' '));

	eleventyConfig.addFilter("removeTags", (content) => {
		return content.split("<p>#")[0]
	})

	eleventyConfig.addFilter("extractTags", (content) => {
		let tags = content.split("<p>#")[1];
		return tags ? "<p>#"+tags : ""
	})

	// Customize Markdown library settings:
	eleventyConfig.amendLibrary("md", mdLib => {
		mdLib.use(mdIterator, 'url_new_win', 'link_open', function (tokens, idx) {
			const [attrName, href] = tokens[idx].attrs.find(attr => attr[0] === 'href')
			
			if (href && (!href.includes('mycabinetofcuriosities.com') && !href.startsWith('/') && !href.startsWith('#'))) {
			  tokens[idx].attrPush([ 'target', '_blank' ])
			  tokens[idx].attrPush([ 'rel', 'noopener noreferrer' ])
			}
		  }).use(markdownItAnchor, {
			permalink: markdownItAnchor.permalink.ariaHidden({
				placement: "after",
				class: "header-anchor",
				symbol: "#",
				ariaHidden: false,
			}),
			level: [1,2,3,4],
			slugify: eleventyConfig.getFilter("slugify")
		}).use(markdownItFootnote)
		.use(markdownItEmoji);
	});

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return (new Date()).toISOString();
	})

	eleventyConfig.addNunjucksFilter("getVarFromString", function(varName) {
		return this.getVariables()[varName];
	  });

	eleventyConfig.addCollection("webmentionsByPost", collectionApi => {
		let webmentions = collectionApi.getAll()[0].data.webmentions.all;
		const getRelated = (target, arr) => arr.filter(wm => wm["wm-target"] === target);
		const targets = webmentions.map(wb => wb["wm-target"]);
		let likes = webmentions.filter(mention => mention["like-of"]);
		let shares = webmentions.filter(mention => mention["repost-of"])
		let replies = webmentions.filter(mention => mention["in-reply-of"])

		return Object.fromEntries(targets.map(target => [target.split("https://mycabinetofcuriosities.com")[1], {likes: getRelated(target, likes), shares: getRelated(target, shares), replies: getRelated(target,replies)}]));
	})

	eleventyConfig.addCollection('allUpdates', collectionApi => {
		const mentions = collectionApi.getAll()[0].data.webmentions.others;

		return [...collectionApi.getFilteredByTag('likes'), ...collectionApi.getFilteredByTag('notes'), ...mentions, ...collectionApi.getAll()[0].data.mastodon.replies].sort((a,b) => b.date - a.date)
	})

	eleventyConfig.addCollection('allOriginalContent', collectionApi => {
		return [...collectionApi.getFilteredByTag('notes'), ...collectionApi.getFilteredByTag('articles').filter(article => !article.data['read-of'])].sort((a,b) => b.date - a.date)
	})

	eleventyConfig.addCollection('blogPosts', collectionApi => collectionApi.getFilteredByTag('articles').filter(article => !article.data['read-of']))

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

	return {
		// Control which files Eleventy will process
		// e.g.: *.md, *.njk, *.html, *.liquid
		templateFormats: [
			"md",
			"njk",
			"html",
			"liquid",
		],

		// Pre-process *.md files with: (default: `liquid`)
		markdownTemplateEngine: "njk",

		// Pre-process *.html files with: (default: `liquid`)
		htmlTemplateEngine: "njk",

		// These are all optional:
		dir: {
			input: "content",          // default: "."
			includes: "../_includes",  // default: "_includes"
			data: "../_data",          // default: "_data"
			output: "_site"
		},

		// -----------------------------------------------------------------
		// Optional items:
		// -----------------------------------------------------------------

		// If your site deploys to a subdirectory, change `pathPrefix`.
		// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

		// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
		// it will transform any absolute URLs in your HTML to include this
		// folder name and does **not** affect where things go in the output folder.
		pathPrefix: "/",
	};
};
