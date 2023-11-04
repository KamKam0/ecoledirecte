const Account = require('./account')
const Student = require('./student')
const request = require('../api/request')

class Parent extends Account{
    constructor(session, id, password){
        super(id, password, session.token)
        this._setBasicData(session)
        
        const parentAccount = session.data.accounts[0]
        this.parent = {
            prenom: parentAccount.prenom, 
            nom: parentAccount.nom, 
            mail: parentAccount.email,  
            telephone: parentAccount.profile.telPortable, 
            telephoneConjoint: parentAccount.profile.telPortableConjoint
        }
        
        this.enfants = Object.values(parentAccount.profile.eleves.map(child => {
            child.token = session.token
            return new Student(child, id, password, true)
        }))
    }

    async getMails(){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/familles/${this.user.id}/messages.awp?force=false&typeRecuperation=received&idClasseur=0&orderBy=date&order=desc&query=&onlyRead=&page=0&itemsPerPage=100&getAll=0&verbe=get&v=4.43.0`, this.session.token)
            .catch(err => reject(err))
            .then(datas => resolve(datas.data.messages) )
        })
    }

    async getSituationFinanciere(){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/factures`, this.session.token)
            .catch(err => reject(err))
            .then(datas => resolve(datas.data) )
        })
    }

    async getInfos(){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/famillecoordonnees`, this.session.token)
            .catch(err => reject(err))
            .then(datas => resolve(datas.data) )
        })
    }

    async getDocuments(){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/familledocuments.awp?archive=&verbe=get&v=4.43.0`, this.session.token)
            .catch(err => reject(err))
            .then(datas => resolve(datas.data) )
        })
    }

    getChildren(identifier){
        if(typeof identifier === "string") return this.enfants.find(instance => instance.eleve.prenom === identifier)
        else if(typeof identifier === "number") return this.enfants[identifier]
        else return null
    }
}

module.exports = Parent