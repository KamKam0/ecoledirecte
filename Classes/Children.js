class Children{
    constructor(datas, id, mdp, token){
        this.Student = {ID: datas.id, Nom: datas.nom, Prenom: datas.prenom, Sexe: datas.sexe, Photo: datas.photo.length === 0 ? null : datas.photo}
        this.Classe = {ID: datas.classe.id, Code: datas.classe.code, Libelle: datas.classe.libelle}
        this.Etablissement = {Nom: datas.nomEtablissement, ID: datas.idEtablissement}
        this.Place = datas.place
    }
}

module.exports = Children