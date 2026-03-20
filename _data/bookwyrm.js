const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function () {
    const url = "https://bookwyrm.social/user/donthatedontkill/rss";

    try {
        const response = await EleventyFetch(url, {type: 'parsed-xml', duration: "0s"})
        // const mostRecentlyAdded = response.orderedItems[0]
        // const {id, title, description, cover, authors } = mostRecentlyAdded;
        // const authorResponses = await Promise.all(authors.map(uri => EleventyFetch(uri+'.json', {type: 'json', duration: "0s"})));
        // const authorText = authorResponses.filter(Boolean).map(({name}) => console.log(name) || name).join(', '); 
        // const parser = new DOMParser();
        // const xmlDoc = parser.parseFromString(response, 'text/xml');
        return response.children[0].children[0].children.filter(child => child.name === 'item').map((item, index) => {
            const date = new Date(item.children.find(child => child.name === "pubDate").children[0].text);
            const url = item.children.find(child => child.name === "link").children[0].text
            const title = item.children.find(child => child.name === 'title').children[0].text
            const description = item.children.find(child => child.name === "description").children[0].text
            const content = `<h6 class="fw-bold">${title}</h6><p>${description}</p>`
            return {
                date,
                url,
                content
            }
        })
        const items = response.getElementsByTagName('item');
        return items.map(item => ({
            date: new Date(item.getElementsByTagName('pubDate')[0].textContent),
            content: item.getElementsByTagName('description')[0].textContent,
            url: item.getElementsByTagName('link')[0].textContent,
        }))

        return response
    } catch (err) {
        console.error(err)
        return null
    }
}