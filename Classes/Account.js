const Student = require("./Student")
const Parent = require("./Parent")
const Teacher = require("./Teacher")
const Error = require("./Error")

class Account{
    constructor(Identifiant, MotdePasse){
        this.Identifiant = Identifiant
        this.MotdePasse = MotdePasse
    }

    async Login(){
        return new Promise(async (resolve, reject) => {
            let params = {
                method: "POST",
                headers: {
                    authority: 'api.ecoledirecte.com',
                    accept: 'application/json, text/plain, */*',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
                    'content-type': 'application/x-www-form-urlencoded',
                    origin: 'https://www.ecoledirecte.com',
                    'sec-fetch-site': 'same-site',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-dest': 'empty',
                    referer: 'https://www.ecoledirecte.com/',
                    'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
                },
                body: `data={\n	\"identifiant\": \"${this.Identifiant}\",\n	\"motdepasse\": \"${this.MotdePasse}\"\n}`
            }
            let datas = await require("node-fetch")("https://api.ecoledirecte.com/v3/login.awp", params)
            datas = await datas.json()
            if(datas.code !== 200) return reject(new Error(datas))
            else{
                switch(datas.data.accounts[0].typeCompte){
                    case("E"): return resolve(new Student(datas, this.Identifiant, this.MotdePasse))
                    case("2"): return resolve(new Parent(datas, this.Identifiant, this.MotdePasse))
                }
            }
        })
    }
}

module.exports = Account