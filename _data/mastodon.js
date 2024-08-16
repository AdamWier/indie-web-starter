const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function () {
    const url = `https://mastodon.social/api/v1/accounts/112156626614796336/statuses?exclude_reblogs=true`

    try {
        const statuses = await EleventyFetch(url, {type: 'json', duration: "0s"})
        console.log(statuses)
        return statuses.filter(status => status.content && !status.content.includes('@')).map(status => ({
            ...status,
            date: new Date(status.created_at),
        }))
    } catch (err) {
        console.error(err)
        return null
    }
}