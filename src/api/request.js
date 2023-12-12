const fetch = require("node-fetch")
const constants = require("../utils/constants")
const utils = require('../utils/utils')

module.exports = async (rawLink, token) => {
    return new Promise(async (resolve, reject) => {
        let link = constants.ecoleDirecteAPIBase+rawLink
        if (!link.includes(constants.ecoleDirecteAPIEndBase.split('?')[0])) {
            link += constants.ecoleDirecteAPIEndBase
        }
        let request;

        try {
            request = await fetch(link, {
                method: "POST",
                headers: utils.getHeaders(token),
                body: `data={\n	\"token\": \"${token}\"\n}`
            })
        } catch(err) {
            return reject(err)
        }
        
        if(request.status !== 200) return reject(request)
            
        const data = await request.json()

        if(![200, 210].includes(data.code)) return reject(data)
        
        return resolve(data)
    })
}