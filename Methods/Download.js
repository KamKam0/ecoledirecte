module.exports = async (ID, Type, Token) => {
    return new Promise(async (resolve, reject) => {
        const conv = {
            "D": "FICHIER_CDT",
            "M": "PIECE_JOINTE",
            "C": "CLOUD",
            "doc": "Doc"
        }
        let research = await require("node-fetch")(`https://api.ecoledirecte.com/v3/telechargement.awp?fichierId=${encodeURIComponent(ID)}&leTypeDeFichier=${conv[Type]}&verbe=post`, {
            method: "POST",
            headers: require("../constants").Headers,
            body: `data={\n	\"token\": \"${Token}\"}`
        })
        if(research.status === 200){
            let body = await research.buffer()
            return resolve(body)
        }else return reject(research)
    })
}