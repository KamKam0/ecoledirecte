const Children = require("./Children")
class Parent{
    constructor(session, id , mdp){
        this.Session = {Token: session.token, Code: 200, Message: "Connected", SocketToken: session.data.accounts[0].socketToken, UID: session.data.accounts[0].uid, IDLogin: session.data.accounts[0].idLogin}
        this.User = {ID: session.data.accounts[0].id, TypeAccount: session.data.accounts[0].typeCompte, Identifiant: session.data.accounts[0].identifiant, LastConnexion: session.data.accounts[0].lastConnexion}
        this.Parent = {Prenom: session.data.accounts[0].prenom, Nom: session.data.accounts[0].nom, Mail: session.data.accounts[0].email, Année: session.data.accounts[0].anneeScolaireCourante, Tel: session.data.accounts[0].profile.telPortable, TelConjoint: session.data.accounts[0].profile.telPortableConjoint}
        this.Etablissement = {Nom: session.data.accounts[0].nomEtablissement, Logo: session.data.accounts[0].logoEtablissement, CouleurAgenda: session.data.accounts[0].couleurAgendaEtablissement}
        this.Modules = session.data.accounts[0].modules
        this.Datas = {LastPing: Date.now(), ID: id, MDP: mdp, State: "Connected"}
        this.Enfants = Object.values(session.data.accounts[0].profile.eleves.map(ch => new Children(ch, id, mdp, this.Session.Token)))
    }

    async #Reload(){
        let params = {
            method: "POST",
            headers: require("../constants").Headers,
            body: "data="+ JSON.stringify({
                uuid: "",
                identifiant: this.Datas.ID,
                motdepasse: this.Datas.MDP,
                isReLogin: false
            })
        }
        let datas = await require("node-fetch")("https://api.ecoledirecte.com/v3/login.awp", params)
        datas = await datas.json()
        if(datas.code !== 200){
            this.Session.Code = datas.code
            this.Session.Message = datas.message
            this.Datas.State = "Disconnected"
        } 
        else{
            this.Session = {Token: datas.token, Code: 200, Message: "Connected", SocketToken: datas.data.accounts[0].socketToken, UID: datas.data.accounts[0].uid, IDLogin: datas.data.accounts[0].idLogin}
            this.Datas.LastPing = Date.now()
        }
    }

    getMailsParent(){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.#Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/familles/${this.User.ID}/messages.awp?verbe=getall&orderBy=date&order=desc`, this.Session.Token)
            .catch(err =>reject(new Error(err)))
            .then(datas => resolve(datas.data.messages) )
        })
    }

    getSituationFinanciere(){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.#Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/factures.awp?verbe=get`, this.Session.Token)
            .catch(err =>reject(new Error(err)))
            .then(datas => resolve(datas.data.messages) )
        })
    }

    getInfos(){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.#Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/famillecoordonnees.awp?verbe=get`, this.Session.Token)
            .catch(err =>reject(new Error(err)))
            .then(datas => resolve(datas.data.messages) )
        })
    }

    getDocuments(){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.#Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/familledocuments.awp?archive=&verbe=get`, this.Session.Token)
            .catch(err =>reject(new Error(err)))
            .then(datas => resolve(datas.data.messages) )
        })
    }

    getChildren(da){
        if(typeof da === "number") return this.Enfants.find(el => el.Student.Prenom === da)
        else if(typeof da === "string") return this.Enfants[da]
        else return null
    }

    getNotesChildren(children){
        let User = this.getChildren(children)
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.#Reload()
        return new Promise(async (resolve, reject) => {
            if(!User) return reject("invalid User")
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/eleves/${User.ID}/notes.awp?verbe=get`, this.Session.Token)
            .catch(err =>reject(new Error(err)))
            .then(datas => { 
                let tron_by_periode = []
                datas.data.periodes.forEach(period => {
                    let first_array = []
                    let edatas = period.ensembleMatieres.disciplines
                    edatas.filter(da => da.groupeMatiere).forEach(opt => {
                        first_array.push({opt: opt.discipline, datas: edatas.filter(da => !da.groupeMatiere && da.idGroupeMatiere === opt.id).map(mat => mat.codeMatiere)})
                    })
                    tron_by_periode.push({code: period.codePeriode, datas: first_array})
                })
                return resolve({notes: datas.data.notes, periodes: datas.data.periodes, trons: tron_by_periode})
            })
        })
    }

    getPeriodesChildren(children){
        let User = this.getChildren(children)
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.#Reload()
        return new Promise(async (resolve, reject) => {
            if(!User) return reject("invalid User")
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/eleves/${User.ID}/notes.awp?verbe=get`, this.Session.Token)
            .catch(err =>reject(new Error(err)))
            .then(datas => resolve(datas.data.periodes))
        })
    }

    getMatieresChildren(children){
        let User = this.getChildren(children)
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.#Reload()
        return new Promise(async (resolve, reject) => {
            if(!User) return reject("invalid User")
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/eleves/${User.ID}/notes.awp?verbe=get`, this.Session.Token)
            .catch(err =>reject(new Error(err)))
            .then(datas => {
                datas = datas.data.notes
                let global = []
                if(!datas[0]) return resolve(global)
                datas.forEach(note => {
                    if(!global.find(n => n.matiere === note.libelleMatiere)){
                        global.push({matiere: note.libelleMatiere, code: note.codeMatiere})
                    }
                })
                return resolve(global)
            })
        })
    }

    getEmploiDuTempsChildren(children){
        let User = this.getChildren(children)
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.#Reload()
        return new Promise(async (resolve, reject) => {
            if(!User) return reject("invalid User")
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/E/${User.ID}/emploidutemps.awp?verbe=get&v=4.6.0`, this.Session.Token)
            .catch(err =>reject(new Error(err)))
            .then(datas => {
                datas = datas.data.map(e => {return {...e, compare_date: Date.parse(new Date(e.start_date))}}).sort((a, b) => a.compare_date - b.compare_date)
                let toreturn;
                if(!datas[0] || datas[0].text === "CONGÉS") return resolve("Aucun Cours Aujourd'hui")
                toreturn = datas.map(c => `${c.isAnnule ? "/!\\ CANCELED /!\\" : ""}\n🎓 ${c.typeCours === "PERMANENCE" ? "Pause" : c.matiere}\n🕐 ${c.start_date.split(" ")[1]} - ${c.end_date.split(" ")[1]}${c.prof.trim().length > 1 ? `\n🧑‍💻 ${c.prof}` : ""} ${c.salle.trim().length > 0 ? `\n🏫  ${c.salle}` : ""}\n${c.isAnnule ? "/!\\ CANCELED /!\\" : ""}`).join("\n")
                return resolve(toreturn)
            })
        })
    }

    getMailsChildren(children){
        let User = this.getChildren(children)
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.#Reload()
        return new Promise(async (resolve, reject) => {
            if(!User) return reject("invalid User")
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/eleves/${User.ID}/messages.awp?verbe=getall&orderBy=date&order=desc`, this.Session.Token)
            .catch(err =>reject(new Error(err)))
            .then(datas => resolve(datas.data.messages) )
        })
    }

    DownloadPhotoEleve(children){
        let User = this.getChildren(children)
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.#Reload()
        return new Promise(async (resolve, reject) => {
            if(!User) return reject("invalid User")
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Photo(this.Eleve.Photo)
            .catch(err =>reject(new Error(err)))
            .then(datas => resolve(datas) )
        })
    }
    
    getHomeworkChildren(children){
        let User = this.getChildren(children)
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.#Reload()
        return new Promise(async (resolve, reject) => {
            if(!User) return reject("invalid User")
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/Eleves/${User.ID}/cahierdetexte.awp?verbe=get`, this.Session.Token)
            .catch(err =>reject(new Error(err)))
            .then(datas => {
                datas = datas.data
                if(!Object.values(datas)[0]) return resolve("Aucun Travail à faire !")
                return resolve(datas)
            })
        })
    }

    getVieScolaireChildren(children){
        let User = this.getChildren(children)
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.#Reload()
        return new Promise(async (resolve, reject) => {
            if(!User) return reject("invalid User")
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/eleves/${User.ID}/viescolaire.awp?verbe=get`, this.Session.Token)
            .catch(err =>reject(new Error(err)))
            .then(datas => {
                let truedata = {}
                Object.entries(datas.data).filter(e => e[0] !== "parametrage").forEach(da => truedata[da[0]] = da[1])
                return resolve(truedata)
            })
        })
    }
}

module.exports = Parent