const Account = require('./account')
const request = require('../api/request')
const Photo = require('../api/downloads/photo')
const Download = require('../api/downloads/file')
const utils = require('../utils/utils')

class Student extends Account{
    constructor(session, id, password, isChild=false){
        super(id, password, session.token)
        
        this._setBasicData(session, isChild)
        
        const studentAccount = isChild ? session : session.data.accounts[0]
        const profileLink = isChild ? studentAccount : studentAccount.profile
        this.eleve = {
            prenom: studentAccount.prenom, 
            nom: studentAccount.nom, 
            mail: studentAccount.email || null, 
            sexe: profileLink.sexe,
            photo: profileLink.photo.length === 0 ? null : profileLink.photo
        }
        this.classe = {
            id: profileLink.classe.id, 
            code: profileLink.classe.code, 
            nom: profileLink.classe.libelle
        }
    }

    async getNotes(){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/eleves/${this.user.id}/notes`, this.session.token)
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
            .catch(err => reject(err))
        })
    }

    async getPeriodes(){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/eleves/${this.user.id}/notes`, this.session.token)
            .catch(err => reject(err))
            .then(datas => resolve(datas.data.periodes))
        })
    }

    async getMatieres(){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/eleves/${this.user.id}/notes`, this.session.token)
            .catch(err => reject(err))
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

    async getInfos(){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            let totr = {
                id: this.user.id,
                type_account: this.user.accountType,
                der_co: this.user.lastConnexion,
                prenom: this.eleve.prenom,
                nom: this.eleve.nom,
                email: this.eleve.mail,
                etablissement: this.etablissement.nom,
                sexe: this.eleve.sexe,
                classe: this.classe.nom,
                photo: this.eleve.photo
            }

            return resolve(totr)
        })
    }

    async getTeachers(){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/messagerie/contacts/professeurs.awp?verbe=get&idClasse=${this.classe.id}&v=4.43.0`, this.session.token)
            .catch(err => reject(err))
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

    async getEmploiDuTemps(){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/E/${this.user.id}/emploidutemps.awp?verbe=get&v=4.6.0`, this.session.token)
            .catch(err => reject(err))
            .then(datas => {
                datas = datas.data.map(e => {return {...e, compare_date: Date.parse(new Date(e.start_date))}}).sort((a, b) => a.compare_date - b.compare_date)
                let toreturn;
                if(!datas[0] || datas[0].text === "CONGÉS") return resolve("Aucun Cours Aujourd'hui")
                toreturn = datas.map(c => `${c.isAnnule ? "/!\\ CANCELED /!\\" : ""}\n🎓 ${c.typeCours === "PERMANENCE" ? "Pause" : c.matiere}\n🕐 ${c.start_date.split(" ")[1]} - ${c.end_date.split(" ")[1]}${c.prof.trim().length > 1 ? `\n🧑‍💻 ${c.prof}` : ""} ${c.salle.trim().length > 0 ? `\n🏫  ${c.salle}` : ""}\n${c.isAnnule ? "/!\\ CANCELED /!\\" : ""}`).join("\n")
                return resolve(toreturn)
            })
        })
    }

    async getMails(){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/eleves/${this.user.id}/messages.awp?verbe=getall&orderBy=date&order=desc&v=4.43.0`, this.session.token)
            .catch(err => reject(err))
            .then(datas => resolve(datas.data.messages))
        })
    }

    async downloadProfilePicture(){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            Photo(this.eleve.photo)
            .catch(err => reject(err))
            .then(datas => resolve(datas) )
        })
    }
    
    async getStaff(){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/messagerie/contacts/personnels`, this.session.token)
            .catch(err => reject(err))
            .then(datas => {
                let contacts = datas.data.contacts
                let def = contacts.map(c => `${c.civilite === "Mme" ? `👩  ${c.prenom} ${c.nom} (${c.fonction.libelle})` : `👨  ${c.prenom} ${c.nom} (${c.fonction.libelle})`}`).join("\n\n")
                return resolve(def)
            })
        })
    }

    async getHomework(){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/Eleves/${this.user.id}/cahierdetexte`, this.session.token)
            .catch(err => reject(err))
            .then(datas => {
                datas = datas.data
                if(!Object.values(datas)[0]) return resolve("Aucun Travail à faire !")
                return resolve(datas)
            })
        })
    }

    async getHomeworkByDay(day){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/Eleves/${this.user.id}/cahierdetexte/${day}`, this.session.token)
            .catch(err => reject(err))
            .then(hmow => {
                const htmlToText = utils.htmlToText
                let devoirs_total = []
                hmow.data.matieres.forEach(ma => {
                    if(ma.aFaire){
                        let texte = Buffer.from(ma.aFaire.contenu, "base64").toString()
                        texte = htmlToText(texte)
                        devoirs_total.push({Date: new Date(day).toUTCString("fr"), Matiere: ma.matiere, Prof: ma.nomProf, Contenu: texte, Donnele: new Date(ma.aFaire.donneLe).toUTCString("fr"), IDdevoir: ma.aFaire.idDevoir, Documents: ma.aFaire.documents})
                    }
                })
                return resolve(devoirs_total)
            })
        })
    }

    async getCloud(){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/cloud/E/${this.user.id}`, this.session.token)
            .catch(err => reject(err))
            .then(datas => resolve(datas.data[0]) )
        })
    }

    async download(id, type){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            Download(id, type, this.session.token)
            .catch(err => reject(err))
            .then(datas => resolve(datas))
        })
    }

    async getMail(id){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/eleves/${this.user.id}/messages/${id}.awp?verbe=get&mode=destinataire&v=4.43.0`, this.session.token)
            .catch(err => reject(err))
            .then(datas => {
                datas = datas.data
                let texte = Buffer.from(datas.content, "base64").toString()
                datas.content = utils.htmlToText(texte)
                return resolve(datas)
            })
        })
    }

    async getDocuments(){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/elevesDocuments`, this.session.token)
            .catch(err => reject(err))
            .then(datas => {
                return resolve(datas.data)
            })
        })
    }

    async getVieScolaire(){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/eleves/${this.user.id}/viescolaire`, this.session.token)
            .catch(err => reject(err))
            .then(datas => {
                if (datas.message.includes('Aucune')) {
                    return resolve(datas.message)
                }

                let truedata = {}
                Object.entries(datas.data).filter(e => e[0] !== "parametrage").forEach(da => truedata[da[0]] = da[1])
                return resolve(truedata)
            })
        })
    }

    calculerMoyenne(notes, trons, period){
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

    async searchMails(query){
        return new Promise(async (resolve, reject) => {
            let reloaded = await this._reload()
            if(!reloaded) {
                return reject('Cloud not retrieve token')
            }

            request(`/eleves/${this.user.id}/messages.awp?force=true&typeRecuperation=received&idClasseur=0&orderBy=date&order=desc&query=${encodeURIComponent(query)}&onlyRead=&page=0&itemsPerPage=20&verbe=getall&v=4.6.0`, this.session.token)
            .catch(err => reject(err))
            .then(datas => {
                datas = datas.data.messages.received
                return resolve(datas)
            })
        })
    }
}

module.exports = Student