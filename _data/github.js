const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function () {
    const url = `https://api.github.com/users/adamwier/repos`

    try {
        const response = await EleventyFetch(url, {type: 'json', duration: "0s"})
        const latestUpdated = response.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at))[0]
        const commits = await EleventyFetch(latestUpdated.commits_url.split('{')[0], {type: 'json', duration: "0s"})
        return {
            commit: commits[0],
            repostiory: latestUpdated,
        }
    } catch (err) {
        console.error(err)
        return null
    }
}