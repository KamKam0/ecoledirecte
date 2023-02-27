function htmlToText(texte){
    const correspondance = require("./constants").caractersHTML
    correspondance.forEach(element => {
        if(texte.includes(element.htmlOne)) texte = texte.replaceAll(element.htmlOne, element.text)
        if(texte.includes(element.htmlTwo)) texte = texte.replaceAll(element.htmlTwo, element.text)
    })
    texte = texte.split('<').filter(e => e.split(">")[1]).map(e => {
        let textPlus = []
        if(e.includes("link")) textPlus.push(e.split(">")?.find(v => v.includes("href="))?.split("href=")?.[1]?.slice(1, -1) || "")
        textPlus = textPlus.filter(e => e.length > 0)
        return textPlus.length > 0 ? textPlus.join(" ") + " " + e.split(">")[1] : e.split(">")[1]
    }).join("")
    return texte
}

module.exports = {htmlToText}