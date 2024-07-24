const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function () {
    const eventsUrl = `https://api.github.com/users/adamwier/events`;
    const userUrl = "https://api.github.com/users/adamwier";

    try {
        const response = await EleventyFetch(eventsUrl, {type: 'json', duration: "0s"})
        const myPushEvents = response.filter(event => event.type === "PushEvent" && event.payload.commits[0].author.name === "AdamWier");
        const gitHubActivity = myPushEvents.map(event => ({
            message: event.payload.commits[0].message,
            commitUrl: event.payload.commits[0].url 
        }));
        return gitHubActivity;
    } catch (err) {
        console.error(err)
        return null
    }
}