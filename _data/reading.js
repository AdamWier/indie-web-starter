const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function () {
    const url = "https://bookwyrm.social/user/donthatedontkill/books/reading.json?page=1";

    try {
        const response = await EleventyFetch(url, {type: 'json', duration: "0s"})
        const mostRecentlyAdded = response.orderedItems[0]
        const {id, title, description, cover, authors } = mostRecentlyAdded;
        const authorResponses = await Promise.all(authors.map(uri => EleventyFetch(uri+'.json', {type: 'json', duration: "0s"})));
        const authorText = authorResponses.filter(Boolean).map(({name}) => console.log(name) || name).join(', '); 

        return {
            url: id,
            title,
            description,
            coverUrl: cover.url,
            authorText
        }
    } catch (err) {
        console.error(err)
        return null
    }
}