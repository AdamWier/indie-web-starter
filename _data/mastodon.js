const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function () {
    const url = `https://mastodon.social/api/v1/accounts/112156626614796336/statuses?exclude_reblogs=true`

    try {
        const statuses = await EleventyFetch(url, {type: 'json', duration: "0s"})
        return statuses.filter(status => status.content && !status.content.includes('@'))
    } catch (err) {
        console.error(err)
        return null
    }
}