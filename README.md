# EcoleDirecte
EcoleDirecte is a simple to use module that allows you to interact with EcoleDirecte API.

## Installation
```js
npm i @kamkam1_0/ecoledirecte.js
```

## Initiation
```js
const EcoleDirecte = require("@kamkam1_0/ecoledirecte")
const Account =  new EcoleDirecte.Account("LOGIN ID", "LOGIN PASSWORD")
let Session = await Account.Login()
```

## How to use

The module only supports students account for now.

### Marks

```js
let Marks = await Session.getNotes()
/* Expexted Output
    {
        notes: [
            {
                id: 2097437,
                devoir: '',
                codePeriode: '',
                codeMatiere: '',
                libelleMatiere: '',
                codeSousMatiere: '',
                typeDevoir: '',
                enLettre: false,
                commentaire: '',
                uncSujet: '',
                uncCorrige: '',
                coef: '',
                noteSur: '',
                valeur: '',
                nonSignificatif: false,
                date: '2022-09-19',
                dateSaisie: '2022-09-26',
                valeurisee: false,
                moyenneClasse: '',
                minClasse: '',
                maxClasse: '',
                elementsProgramme: []
            },...
        ],
        periodes: [
            {
                idPeriode: 'A001',
                codePeriode: 'A001',
                periode: '1er Semestre',
                annuel: false,
                dateDebut: '2022-09-02',
                dateFin: '2023-01-20',
                examenBlanc: false,
                cloture: false,
                moyNbreJoursApresConseil: -1,
                ensembleMatieres: [Object]
            },...
        ],
        trons: [
            { code: 'A001', datas: [Array] },
            ...
        ]
    }
*/
```

### Mails

```js
let Mails = await Session.getMails()
/* Expexted Output
    {
        received: [
            {
                id: 35,
                mtype: 'received',
                read: true,
                idDossier: -1,
                idClasseur: 0,
                transferred: false,
                answered: false,
                to_cc_cci: 'cci',
                brouillon: false,
                subject: '',
                content: '',
                date: '2022-08-22 12:33:56',
                to: [],
                files: [ [Object], [Object], [Object] ],
                from: {
                    name: '',
                    nom: '',
                    prenom: '',
                    particule: '',
                    civilite: '',
                    role: '',
                    listeRouge: false,
                    id: 310,
                    read: true,
                    fonctionPersonnel: ''
                }
            },
            ...
        ],
        sent: [
            {
                id: 5799,
                mtype: 'send',
                read: true,
                idDossier: -2,
                idClasseur: 0,
                transferred: false,
                answered: false,
                to_cc_cci: '',
                brouillon: false,
                subject: '',
                content: '',
                date: '2022-09-12 21:42:30',
                to: [Array],
                files: [],
                from: [Object]
            },
            ...
        ],
        draft: [],
        archived: []
    }
*/
```

### Mails - Search

```js
let Mails = await Session.SearchMails(query)
/* Expexted Output
    [
        {
            id: 5291,
            mtype: 'received',
            read: true,
            idDossier: -1,
            idClasseur: 0,
            transferred: false,
            answered: false,
            to_cc_cci: 'to',
            brouillon: false,
            subject: '',
            content: '',
            date: '2022-09-12 11:42:00',
            to: [],
            files: [ [Object], [Object] ],
            from: {
                name: '',
                nom: '',
                prenom: '',
                particule: '',
                civilite: '',
                role: '',
                listeRouge: false,
                id: 471,
                read: true,
                fonctionPersonnel: ''
            }
        },
        ...
    ]
*/
```

### Periodes

```js
let Periodes = await Session.getPeriodes()
/* Expexted Output
    [
        {
            idPeriode: 'A001',
            codePeriode: 'A001',
            periode: '1er Semestre',
            annuel: false,
            dateDebut: '2022-09-02',
            dateFin: '2023-01-20',
            examenBlanc: false,
            cloture: false,
            moyNbreJoursApresConseil: -1,
            ensembleMatieres: {
                dateCalcul: '2022-12-22 21:04',
                moyenneGenerale: '',
                moyenneClasse: '',
                moyenneMin: '',
                moyenneMax: '',
                nomPP: '',
                appreciationPP: '',
                nomCE: '',
                decisionDuConseil: '',
                disciplines: [Array],
                disciplinesSimulation: []
            }
        },
    ]
*/
```

### Subjects

```js
let Subjects = await Session.getMatieres()
/* Expexted Output
    [
        { matiere: '', code: '' },
        ...
    ]
*/
```

### Teachers

```js
let Teachers = await Session.getTeachers()
/* Expexted Output
    {
        def: 
            '👨  NAME (Subject)\n' +
            '\n' +
            '👨  NAME (Subject)\n' +
            '\n' +
            '👩  NAME (Subject)\n'
        total: [
            {
                id: 0125,
                code: '',
                libelle: '',
                isPP: true,
                matiere: ''
            },
            ...
        ]
    }
*/
```

### Schedule

```js
let Schedule = await Session.getEmploiDuTemps()
/* Expexted Output

*/
```

### Picture

Get the buffer of your profil picture

```js
let Picture = await Session.DownloadPhotoEleve()
/* Expexted Output
    <Buffer>
*/
```

### Staff

```js
let Staff = await Session.getStaff()
/* Expexted Output
    '👨  NAME (Subject)\n' +
    '\n' +
    '👨  NAME (Subject)\n' +
    '\n' +
    '👩  NAME (Subject)\n'
*/
```

### HomeWork

```js
let HomeWork = await Session.getHomework()
/* Expexted Output
    {
        '2023-01-03': [
            {
                matiere: '',
                codeMatiere: '',
                aFaire: true,
                idDevoir: 15537,
                documentsAFaire: false,
                donneLe: '2022-12-20',
                effectue: false,
                interrogation: false,
                rendreEnLigne: false
            }
        ],
        ...
    }
*/
```

### HomeWork with a day

You can also get homework for a specific day (including what you have to do)

```js
let HomeWork = await Session.getHwByDay(day)
/* Expexted Output
    [
        {
            Date: 'Tue, 03 Jan 2023 00:00:00 GMT',
            Matiere: '',
            Prof: '',
            Contenu: '',
            Donnele: 'Tue, 20 Dec 2022 00:00:00 GMT',
            IDdevoir: 15537,
            Documents: []
        },
        ...
    ]
*/
```

### Cloud

```js
let Cloud = await Session.getCloud()
/* Expexted Output
    {
        type: 'folder',
        libelle: '/',
        date: '2021-09-17 16:59:00',
        taille: 4795209,
        quota: 2147483648,
        id: '',
        isLoaded: true,
        children: [
            {
                type: 'folder',
                libelle: 'Pièces Jointes',
                date: '2021-09-17 16:59:00',
                taille: 4795209,
                id: '',
                isLoaded: true,
                children: [Array]
            }
        ]
    }
*/
```

### Documents

```js
let Documents = await Session.getDocuments()
/* Expexted Output
    {
        factures: [],
        notes: [
            {
                id: 21963,
                libelle: 'Relevé Relevé ',
                idEleve: ,
                date: '2022-12-09',
                type: 'Note',
                signatureDemandee: false,
                signature: {}
            }
        ],
        viescolaire: [],
        administratifs: [
            {
                id: 26441,
                libelle: "",
                idEleve: ,
                date: '2022-12-20',
                type: 'Doc',
                signatureDemandee: false,
                signature: {}
            },
            ...
        ],
        inscriptions: [],
        listesPiecesAVerser: {
            listesPieces: [],
            personnes: [],
            pieces: [],
            televersements: []
        }
    }
*/
```

### School Life

```js
let SchoolLife = await Session.getVieScolaire()
/* Expexted Output
    {
        absencesRetards: [
            {
                id: 22378,
                idEleve: 0,
                nomEleve: '',
                typeElement: 'Absence',
                date: '2022-12-12',
                displayDate: '',
                libelle: '',
                motif: '',
                justifie: true,
                par: '',
                commentaire: '',
                typeJustification: '',
                justifieEd: false,
                aFaire: '',
                dateDeroulement: ''
            },
            ...
        ],
        sanctionsEncouragements: [
            {
                id: 1221,
                idEleve: 0,
                nomEleve: '',
                typeElement: '',
                date: '2022-11-21',
                displayDate: '',
                libelle: '',
                motif: '',
                justifie: false,
                par: '',
                commentaire: '',
                typeJustification: '',
                justifieEd: false,
                aFaire: '',
                dateDeroulement: ''
            },
            ...
        ]
    }
*/
```

### Marks Average

Mars variable is the marks you get with the .getNotes method
Periods variable is the periods you get with the .trons in the .getNotes method
Period variable refers the code of the period. For exemple: A001

```js
let M = await Session.CalculMoyenne(marks, periods, period)
/* Expexted Output
    {
        matieres: [
            {
                matiere: '',
                ns: 0,
                divi: 0,
                moyenne: '0/20',
                count_moyenne: 0
            },
            ...
        ],
        trons: [
            { tron: 'Tronc Commun', ns: 0, divi: 0, moyenne: '0/20' },
            ...
        ],
        general: '0/20'
    }
*/
```

## Downloading files

ID variable is the id of the file.
Type is the ID of the place where you want to download the file:
- D for the homwork page
- M for the mail page
- C for the cloud
- doc for the document page

```js
let M = await Session.Download(ID, Type)
/* Expexted Output
    <Buffer>
*/
```