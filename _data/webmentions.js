const EleventyFetch = require("@11ty/eleventy-fetch");

// data/webmentions.js
const API_ORIGIN = 'https://webmention.io/api/mentions.jf2'

module.exports = async function () {
    const domain = 'mycabinetofcuriosities.com'
    const token = process.env.WEBMENTION_TOKEN
    const url = `${API_ORIGIN}?domain=${domain}&token=${token}`

    try {
        const response = await EleventyFetch(url, {type: 'json'})
        return response
    } catch (err) {
        console.error(err)
        return null
    }
}