const EleventyFetch = require("@11ty/eleventy-fetch");

const convertMinutesToHours = (minutes) => Math.round(minutes / 60 * 100) / 100

module.exports = async function () {
    const url = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=76561198074191549&format=json`
    const createGameUrl = (appId) => `https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`
    const getImageUrl = (appId, hash) => `http://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${hash}.jpg`
    const getStorePageUrl = (appId) => `https://store.steampowered.com/agecheck/app/${appId}`

    try {
        const response = await EleventyFetch(url, {type: 'json', duration: "0s"})
        const promises = response.response.games.map(async game => ({
            title: game.name,
            twoWeeksPlaytime: game.playtime_2weeks > 60 ? `${convertMinutesToHours(game.playtime_2weeks)} hours` : `${game.playtime_2weeks} minutes`,
            imageUrl: getImageUrl(game.appid, game.img_icon_url),
            storePageUrl: getStorePageUrl(game.appid),
            summary: (await EleventyFetch(createGameUrl(game.appid), {type: 'json', duration: '0s'}))[game.appid].data.short_description
        }))
        const gameInfo = await Promise.all(promises)
        console.log(gameInfo)
        const totalMinutes = response.response.games.reduce((prev, current) => {
            return current.playtime_2weeks + prev
        }, 0);
        const totalMinutesMessage = totalMinutes > 60 ? `${convertMinutesToHours(totalMinutes)} hours` : `${totalMinutes} minutes`
        return {gameInfo, totalMinutesMessage}
    } catch (err) {
        console.error(err)
        return null
    }
}