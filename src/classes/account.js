const fetch = require('node-fetch')
const constants = require('../utils/constants')

class Account{
    constructor(id, password, token=null){
        this.session = {
            id,
            password,
            token,
            ping: null,
            connected: false
        }
        this.user = {}
        this.etablissement = {}
    }

    async login(isReloading){
        return new Promise(async (resolve, reject) => {
            let params = {
                method: "POST",
                headers: constants.headers,
                body: "data="+ JSON.stringify({
                    uuid: "",
                    identifiant: this.session.id,
                    motdepasse: this.session.password,
                    isReLogin: false
                })
            }

            let request;
            try {
                request = await fetch(`${constants.ecoleDirecteAPIBase}/login.awp?v=4.43.0`, params)
            } catch(err) {
                return reject(request)
            }

            if(request.status !== 200) return reject(request)
            
            const data = await request.json()

            if(data.code !== 200) return reject(data)
            
            if (!isReloading) {
                switch(data.data.accounts[0].typeCompte){
                    case("E"): 
                        return resolve(new (require("./student"))(data, this.session.id, this.session.password))
                    case("1"): 
                        return resolve(new (require("./parent"))(data, this.session.id, this.session.password))
                    default:
                        return reject('Type of account not supported')
                }
            }

            return resolve(data)
        })
    }

    async _reload(){
        return new Promise((resolve) => {
            this.login(true)
            .then(data => {
                this.session.message = true
                this.session.ping = Date.now()
                this.session.token = data.token
                
                return resolve(true)
            })
            .catch(err => {
                this.session.message = false
                this.session.ping = Date.now()
                this.session.token = null

                return resolve(false)
            })
        })
    }

    _setBasicData(data, isChild=false) {
        if (data.data) {
            data = data.data
        }
        if (isChild) {
            data 
        }

        const dataToAccess = isChild ? data : data.accounts[0]

        this.session.ping = Date.now()
        this.session.connected = true
        this.user = {
            id: dataToAccess.id, 
            accountType: dataToAccess.typeCompte || null,
            lastConnexion: dataToAccess.lastConnexion || null
        }
        this.etablissement = {
            nom: dataToAccess.nomEtablissement, 
            logo: dataToAccess.logoEtablissement || null
        }
    }
}

module.exports = Account