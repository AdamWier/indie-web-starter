const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function () {
    const base = "https://mastodon.social/api/v1/";
    const url = `${base}accounts/112156626614796336/statuses?exclude_reblogs=true`
    const statusUrl = `${base}/statuses/?`

    try {
        const statuses = await EleventyFetch(url, {type: 'json', duration: "0s"})
        const replyResponse = statuses.filter(status => !!status.in_reply_to_id).map(status => ({
            date: new Date(status.created_at),
            content: status.content,
            url: status.url,
            inReplyToId: status.in_reply_to_id
        }));
        const param = replyResponse.map(reply => "id[]="+reply.inReplyToId).join("&");
        const replyStatuses = await EleventyFetch(statusUrl+param, {type: "json", duration: "0s"});
        const replies = replyResponse.map(reply => ({
            ...reply,
            inReplyTo: replyStatuses.find(replyStatus => replyStatus.id === reply.inReplyToId)?.url
        }))
        return {replies}
    } catch (err) {
        console.error(err)
        return null
    }
}