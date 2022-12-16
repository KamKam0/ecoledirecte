module.exports = async (Link) => {
    return new Promise(async (resolve, reject) => {
        const first_request = await require("node-fetch")(`https:${Link}`, {
            headers: {
                Referer: "https://www.ecoledirecte.com/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36"
            }
        })
        const datas = await first_request.buffer()
        return resolve(datas)
    })
}