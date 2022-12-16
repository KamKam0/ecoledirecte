module.exports = async (Link, token) => {
    return new Promise(async (resolve, reject) => {
        let research = await require("node-fetch")(Link, {
            method: "POST",
            headers: require("../constants").Headers,
            body: `data={\n	\"token\": \"${token}\"\n}`
        })
        research = await research.json()
        if(research.code !== 200) return reject(research)
        else return resolve(research)
    })
}