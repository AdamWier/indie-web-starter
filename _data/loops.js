const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function () {
    const url = "https://loops.video/api/v1/feed/account/109586651031760332";

    try {
        const response = await EleventyFetch(url, {type: 'json', duration: "0s"});
        const latestVideos = response.data.filter(video => !video.pinned);
        const postAdaptedVideos = latestVideos.map(video => ({
            date: new Date(video.created_at),
            content: video.caption,
            video: video.media.src_url, 
            // `<video aria-label="${video.media.alt_text}" src="${video.media.src_url}" controls=""></video>`,
            url: video.url,
        }))

        console.log(postAdaptedVideos)

        return {postAdaptedVideos}
    } catch (err) {
        console.error(err)
        return null
    }
}