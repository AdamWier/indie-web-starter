const EleventyFetch = require("@11ty/eleventy-fetch");
const Parser = require("microformats-parser");

// data/webmentions.js
const API_ORIGIN = 'https://webmention.io/api/mentions.jf2'


const verb = {
    "like-of": "liked",
    "in-reply-to": "replied to",
    "repost-of": "reposted",
    "bookmark-of": "bookmarked",
    "mention-of": "mentioned",
    "rsvp": "rsvped to"
}

const fillInTemplate = (child) => `
    <img src="${child.author?.photo}" class="img-fluid update-avatar-photo" /> 
    <a href="${child.author?.url}">
        ${child.author?.name}
    </a> 
    liked 
    <a href="${child["like-of"]}">
        ${child["like-of"]}
    </a>`;

module.exports = async function () {
    const domain = 'mycabinetofcuriosities.com'
    const token = process.env.WEBMENTION_TOKEN
    const url = `${API_ORIGIN}?domain=${domain}&token=${token}`

    try {
        const response = await EleventyFetch(url, {type: 'json', duration: "0s"})
        // let promises = response.children.map(async (child, index) => {
        //     if(child["in-reply-to"]){
        //         const string = await EleventyFetch(child["in-reply-to"], {type: "text", duration: "0s"});
        //         let parsed = Parser.mf2(string, {baseUrl: child["in-reply-to"]})
        //         response.children[index].replyInfo = parsed;
        //         return response.children
        //     }
        //     return response.children
        // })
        // let newChildren = await Promise.all(promises)
        // response.children = newChildren.flat()
        return response.children.map(child =>({
            ...child,
            statement: `${child.author.name} ${verb[child["wm-property"]]} ${child[child["wm-property"]]}`,
            content: child.content?.html || child["like-of"] ? fillInTemplate(child) : `Web mention from ${child.author?.name}`,
            date: new Date(child.published)
        }))
    } catch (err) {
        console.error(err)
        return null
    }
}
