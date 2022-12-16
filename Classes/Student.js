const Error = require("./Error")
const Request = require("../Methods/Trequest")
const Photo = require("../Methods/Elphoto")
const Download = require("../Methods/Download")
class Student{
    constructor(session, id, mdp){
        this.Session = {Token: session.token, Code: 200, Message: "Connected", SocketToken: session.data.accounts[0].socketToken, UID: session.data.accounts[0].uid, IDLogin: session.data.accounts[0].idLogin}
        this.User = {ID: session.data.accounts[0].id, TypeAccount: session.data.accounts[0].typeCompte, Identifiant: session.data.accounts[0].identifiant, LastConnexion: session.data.accounts[0].lastConnexion}
        this.Eleve = {Prenom: session.data.accounts[0].prenom, Nom: session.data.accounts[0].nom, Mail: session.data.accounts[0].email, Année: session.data.accounts[0].anneeScolaireCourante, Sexe: session.data.accounts[0].profile.sexe, Photo: session.data.accounts[0].profile.photo.length === 0 ? null : session.data.accounts[0].profile.photo}
        this.Etablissement = {Nom: session.data.accounts[0].nomEtablissement, Logo: session.data.accounts[0].logoEtablissement, CouleurAgenda: session.data.accounts[0].couleurAgendaEtablissement, ID: session.data.accounts[0].profile.idEtablissement, RNE: session.data.accounts[0].profile.rneEtablissement}
        this.Classe = {ID: session.data.accounts[0].profile.classe.id, Code: session.data.accounts[0].profile.classe.code, Nom: session.data.accounts[0].profile.classe.libelle}
        this.Modules = session.data.accounts[0].modules
        this.Datas = {LastPing: Date.now(), ID: id, MDP: mdp, State: "Connected"}
    }

    async Reload(){
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
            body: `data={\n	\"identifiant\": \"${this.Datas.ID}\",\n	\"motdepasse\": \"${this.Datas.MDP}\"\n}`
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

    getNotes(){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/eleves/${this.User.ID}/notes.awp?verbe=get`, this.Session.Token)
            .catch(err => { return reject(new Error(err))})
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

    getPeriodes(){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/eleves/${this.User.ID}/notes.awp?verbe=get`, this.Session.Token)
            .catch(err => { return reject(new Error(err))})
            .then(datas => { return resolve(datas.data.periodes)})
        })
    }

    getMatieres(){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/eleves/${this.User.ID}/notes.awp?verbe=get`, this.Session.Token)
            .catch(err => { return reject(new Error(err))})
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

    getInfos(){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            let totr = {
                id: this.User.ID,
                type_account: this.User.TypeAccount,
                der_co: this.User.LastConnexion,
                prenom: this.Eleve.Prenom,
                nom: this.Eleve.Nom,
                email: this.Eleve.Mail,
                annee: this.Eleve.Année,
                etablissement: this.Etablissement.Nom,
                sexe: this.Eleve.Prenom,
                classe: this.Classe.Nom,
                photo: this.Eleve.Photo
            }
            return resolve(totr)
        })
    }

    getTeachers(){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/messagerie/contacts/professeurs.awp?verbe=get&idClasse=${this.Classe.ID}`, this.Session.Token)
            .catch(err => { return reject(new Error(err))})
            .then(datas => {
                let contacts = datas.data.contacts
                let def = contacts.map(c => `${c.civilite === "Mme" ? `👩  ${c.prenom} ${c.nom} (${c.classes.map(cl => cl.matiere).join(", ")})` : `👨  ${c.prenom} ${c.nom} (${c.classes.map(cl => cl.matiere).join(", ")})`}`).join("\n\n")
                let total = []
                contacts.forEach(co => {
                    total.push(...co.classes)
                })
                return resolve({def, total})
            })
        })
    }

    getEmploiDuTemps(){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/E/${this.User.ID}/emploidutemps.awp?verbe=get&v=4.6.0`, this.Session.Token)
            .catch(err => { return reject(new Error(err))})
            .then(datas => {
                datas = datas.data.map(e => {return {...e, compare_date: Date.parse(new Date(e.start_date))}}).sort((a, b) => a.compare_date - b.compare_date)
                let toreturn;
                if(!datas[0] || datas[0].text === "CONGÉS") return resolve("Aucun Cours Aujourd'hui")
                toreturn = datas.map(c => `${c.isAnnule ? "/!\\ CANCELED /!\\" : ""}\n🎓 ${c.typeCours === "PERMANENCE" ? "Pause" : c.matiere}\n🕐 ${c.start_date.split(" ")[1]} - ${c.end_date.split(" ")[1]}${c.prof.trim().length > 1 ? `\n🧑‍💻 ${c.prof}` : ""} ${c.salle.trim().length > 0 ? `\n🏫  ${c.salle}` : ""}\n${c.isAnnule ? "/!\\ CANCELED /!\\" : ""}`).join("\n")
                return resolve(toreturn)
            })
        })
    }

    getMails(){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/eleves/${this.User.ID}/messages.awp?verbe=getall&orderBy=date&order=desc`, this.Session.Token)
            .catch(err => { return reject(new Error(err))})
            .then(datas => { return resolve(datas.data.messages) })
        })
    }

    DownloadPhotoEleve(){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Photo(this.Eleve.Photo)
            .catch(err => { return reject(new Error(err))})
            .then(datas => { return resolve(datas) })
        })
    }
    
    getStaff(){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/messagerie/contacts/personnels.awp?verbe=get`, this.Session.Token)
            .catch(err => { return reject(new Error(err))})
            .then(datas => {
                let contacts = datas.data.contacts
                let def = contacts.map(c => `${c.civilite === "Mme" ? `👩  ${c.prenom} ${c.nom} (${c.fonction.libelle})` : `👨  ${c.prenom} ${c.nom} (${c.fonction.libelle})`}`).join("\n\n")
                return resolve(def)
            })
        })
    }

    getHomework(){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/Eleves/${this.User.ID}/cahierdetexte.awp?verbe=get`, this.Session.Token)
            .catch(err => { return reject(new Error(err))})
            .then(datas => {
                datas = datas.data
                if(!Object.values(datas)[0]) return resolve("Aucun Travail à faire !")
                return resolve(datas)
            })
        })
    }

    getHwByDay(day){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/Eleves/${this.User.ID}/cahierdetexte/${day}.awp?verbe=get`, this.Session.Token)
            .catch(err => { return reject(new Error(err))})
            .then(hmow => {
                let devoirs_total = []
                hmow.data.matieres.forEach(ma => {
                    if(ma.aFaire){
                        let texte = Buffer.from(ma.aFaire.contenu, "base64").toString()
                        const { convert } = require("html-to-text")
                        texte = convert(texte)
                        devoirs_total.push({Date: new Date(day).toUTCString("fr"), Matiere: ma.matiere, Prof: ma.nomProf, Contenu: texte, Donnele: new Date(ma.aFaire.donneLe).toUTCString("fr"), IDdevoir: ma.aFaire.idDevoir, Documents: ma.aFaire.documents})
                    }
                })
                return resolve(devoirs_total)
            })
        })
    }

    getCloud(){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/cloud/E/${this.User.ID}.awp?verbe=get`, this.Session.Token)
            .catch(err => { return reject(new Error(err))})
            .then(datas => { return resolve(datas.data[0]) })
        })
    }

    Download(ID, Type){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Download(ID, Type, this.Session.Token)
            .catch(err => { return reject(new Error(err))})
            .then(datas => { return resolve(datas)})
        })
    }

    getMail(ID){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/eleves/${this.User.ID}/messages/${ID}.awp?verbe=get&mode=destinataire`, this.Session.Token)
            .catch(err => { return reject(new Error(err))})
            .then(datas => {
                datas = datas.data
                let texte = Buffer.from(datas.content, "base64").toString()
                const { convert } = require("html-to-text")
                datas.content = convert(texte)
                return resolve(datas)
            })
        })
    }

    getDocuments(){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/elevesDocuments.awp?verbe=get`, this.Session.Token)
            .catch(err => { return reject(new Error(err))})
            .then(datas => {
                return resolve(datas.data)
            })
        })
    }

    getVieScolaire(){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/eleves/${this.User.ID}/viescolaire.awp?verbe=get`, this.Session.Token)
            .catch(err => { return reject(new Error(err))})
            .then(datas => {
                let truedata = {}
                Object.entries(datas.data).filter(e => e[0] !== "parametrage").forEach(da => truedata[da[0]] = da[1])
                return resolve(truedata)
            })
        })
    }

    CalculMoyenne(notes, trons, period){
        trons = trons.find(e => e.code === period).datas
        let toeval = notes.filter(no => no.codePeriode === period)
        let total = []
        toeval.forEach(note => {
            if(note.valeur.includes(",")) note.valeur = note.valeur.replace(",", ".")
            if(total.find(f => f.matiere === note.codeMatiere)){
                if(!isNaN(note.valeur)){
                    total.find(c => c.matiere === note.codeMatiere).divi += Number(note.coef)
                    total.find(c => c.matiere === note.codeMatiere).ns += Number((Number(note.valeur) * Number(20 * Number(note.coef))) / Number(note.noteSur))
                }
            }else{
                if(!isNaN(note.valeur)){
                    total.push({matiere: note.codeMatiere, ns: 0, divi: 0, moyenne: null, count_moyenne: null})
                    total.find(c => c.matiere === note.codeMatiere).divi += Number(note.coef)
                    total.find(c => c.matiere === note.codeMatiere).ns += Number((Number(note.valeur) * Number(20 * Number(note.coef))) / Number(note.noteSur))
                }
            }
        })
        
        let to = 0
        total.forEach(t => {
            let moyenne = (t.ns / t.divi).toFixed(2)
            t.moyenne = `${moyenne}/20`
            to += Number(moyenne)
            t.count_moyenne = Number(moyenne)
        })


        let moyenne_trons = []
        trons.forEach(tron => {
            let topush = {tron: tron.opt, ns: 0, divi: 0, moyenne: null}
            tron.datas.forEach(ma => {
                if(total.find(c => c.matiere === ma)) topush.divi ++
                if(total.find(c => c.matiere === ma)) topush.ns += total.find(c => c.matiere === ma).count_moyenne
            })
            moyenne_trons.push(topush)
        })

        moyenne_trons.forEach(t => {
            let moyenne = (t.ns / t.divi).toFixed(2)
            if(moyenne !== "NaN") t.moyenne = `${moyenne}/20`
        })
        
        let final = {matieres: total, trons: moyenne_trons, general: `${(to / total.length).toFixed(2)}/20`}
        
        return final
    }

    SearchMails(query){
        if((((Date.now() - this.Datas.LastPing) / 1000) / 60) > 10) this.Reload()
        return new Promise(async (resolve, reject) => {
            if(this.Session.Code !== 200) return reject(new Error({code: this.Session.Code, message: this.Session.Message}))
            Request(`https://api.ecoledirecte.com/v3/eleves/${this.User.ID}/messages.awp?force=true&typeRecuperation=received&idClasseur=0&orderBy=date&order=desc&query=${encodeURIComponent(query)}&onlyRead=&page=0&itemsPerPage=20&verbe=getall&v=4.6.0`, this.Session.Token)
            .catch(err => { return reject(new Error(err))})
            .then(datas => {
                datas = datas.data.messages.received
                return resolve(datas)
            })
        })
    }
}

module.exports = Student