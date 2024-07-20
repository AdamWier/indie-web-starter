const EleventyFetch = require("@11ty/eleventy-fetch");
const Parser = require("microformats-parser");

// data/webmentions.js
const API_ORIGIN = 'https://webmention.io/api/mentions.jf2'

module.exports = async function () {
    const domain = 'mycabinetofcuriosities.com'
    const token = process.env.WEBMENTION_TOKEN
    const url = `${API_ORIGIN}?domain=${domain}&token=${token}`

    try {
        const response = await EleventyFetch(url, {type: 'json', duration: "0s"})
        let promises = response.children.map(async (child, index) => {
            if(child["in-reply-to"]){
                const string = await EleventyFetch(child["in-reply-to"], {type: "text", duration: "0s"});
                let parsed = Parser.mf2(string, {baseUrl: child["in-reply-to"]})
                response.children[index].replyInfo = parsed;
                return response.children
            }
            return response.children
        })
        let newChildren = await Promise.all(promises)
        response.children = newChildren.flat()
        return response.children.map(child =>({
            ...child,
            content: child.content.html,
            date: new Date(child.published)
        }))
    } catch (err) {
        console.error(err)
        return null
    }
}