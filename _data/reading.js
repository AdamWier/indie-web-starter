const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function () {
    const url = "https://bookwyrm.social/user/donthatedontkill/books/reading.json?page=1";

    try {
        const response = await EleventyFetch(url, {type: 'json', duration: "0s"})
        const mostRecentlyAdded = response.orderedItems.map(async item => {
            const {id, title, description, cover, authors } = item;
            const authorResponses = await Promise.all(authors.map(uri => EleventyFetch(uri+'.json', {type: 'json', duration: "0s"})));
            const authorText = authorResponses.filter(Boolean).map(({name}) => name).join(', '); 
            return {
                url: id,
                title,
                description,
                coverUrl: cover.url,
                authorText
            }
        })
        return Promise.all(mostRecentlyAdded)
    } catch (err) {
        console.error(err)
        return []
    }
}