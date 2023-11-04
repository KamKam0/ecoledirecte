const fetch = require('node-fetch')

module.exports = async (Link) => {
    return new Promise(async (resolve, reject) => {
        let request;
        
        try {
            request = await fetch(`https:${Link}`, {
                headers: {
                    Referer: 'https://www.ecoledirecte.com/',
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36"
                }
            })
        } catch(err) {
            return reject(err)
        }

        const data = await request.buffer()

        return resolve(data)
    })
}