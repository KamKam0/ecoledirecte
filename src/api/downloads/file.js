const fetch = require('node-fetch')
const constants = require('../../utils/constants')

module.exports = async (ID, Type, Token) => {
    return new Promise(async (resolve, reject) => {
        let research;

        try {
            research = await fetch(`https://api.ecoledirecte.com/v3/telechargement.awp?fichierId=${encodeURIComponent(ID)}&leTypeDeFichier=${constants.fileConverter[Type]}&verbe=post`, {
                method: 'POST',
                headers: constants.headers,
                body: `data={\n	\"token\": \"${Token}\"}`
            })
        } catch(err) {
            return reject(err)
        }

        if(research.status === 200){
            let body = await research.buffer()
            return resolve(body)
        }
        
        return reject(research)
    })
}