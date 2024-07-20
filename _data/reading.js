const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function () {
    const base = "https://openlibrary.org";
    const url = `${base}/people/donthatedontkill1811/books/currently-reading.json`

    try {
        const response = await EleventyFetch(url, {type: 'json', duration: "0s"})
        let key = response.reading_log_entries[0].work.key
        let book = await EleventyFetch(base+key+'.json', {type: 'json', duration: "0s"})
        return {
            ...book,
            author: response.reading_log_entries[0].work.author_names[0]
        }
    } catch (err) {
        console.error(err)
        return null
    }
}