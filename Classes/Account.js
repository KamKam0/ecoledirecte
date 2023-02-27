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
                headers: require("../constants").Headers,
                body: "data="+ JSON.stringify({
                    uuid: "",
                    identifiant: this.Identifiant,
                    motdepasse: this.MotdePasse,
                    isReLogin: false
                })
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