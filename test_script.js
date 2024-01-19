const index = require('./src/index')

const studentAccount = new index.Account('ID', 'PASSWORD')

studentAccount.login()
.then(session => {
    console.log('student login successful')

    session.getMarks()
    .then(marks => {
        console.log(marks)
        console.log('student fetch marks successful')

        session.calculateAverage(marks.notes, marks.trons, 'A001')
        console.log('student calculateAverage successful')
    })
    .catch(err => {
        console.log('student fetch marks failed')
        console.log(err)
    })
    
    session.getPeriods()
    .then(() => console.log('student fetch periods successful'))
    .catch(err => {
        console.log('student fetch periods failed')
        console.log(err)
    })
    
    session.getSubjects()
    .then(() => console.log('student fetch subjects successful'))
    .catch(err => {
        console.log('student fetch subjects failed')
        console.log(err)
    })
    
    session.getInfo()
    .then(() => console.log('student fetch info successful'))
    .catch(err => {
        console.log('student fetch info failed')
        console.log(err)
    })
    
    session.getTeachers()
    .then(() => console.log('student fetch teachers successful'))
    .catch(err => {
        console.log('student fetch teachers failed')
        console.log(err)
    })
    
    session.getSchedule()
    .then(() => console.log('student fetch schedule successful'))
    .catch(err => {
        console.log('student fetch schedule failed')
        console.log(err)
    })
    
    session.getMails()
    .then(mails => {
        console.log('student fetch mails successful')

        if (mails.received?.length) {
            session.getMail(mails.received[0].id)
            .then(() => console.log('student fetch schedule successful'))
            .catch(err => {
                console.log('student fetch schedule failed')
                console.log(err)
            })
    
            let mailWithAttachment = mails.received.find(mail => mail.files.length)
            if (mailWithAttachment) {
                session.download(mailWithAttachment.files[0].id, 'M')
                .then(() => console.log('student download successful'))
                .catch(err => {
                    console.log('student download failed')
                    console.log(err)
                })
            } else {
                console.log('student download cannot be tested')
            }
        }
    })
    .catch(err => {
        console.log('student fetch mails failed')
        console.log(err)
    })
    
    session.downloadProfilePicture()
    .then(() => console.log('student download profile picture successful'))
    .catch(err => {
        console.log('student download profile picture failed')
        console.log(err)
    })
    
    session.getStaff()
    .then(() => console.log('student fetch staff successful'))
    .catch(err => {
        console.log('student fetch staff failed')
        console.log(err)
    })
    
    session.getHomeworkByDay(new Date(Date.now()).toLocaleDateString('fr').split('/').reverse().join('-'))
    .then(() => console.log('student fetch homework successful'))
    .catch(err => {
        console.log('student fetch homework failed')
        console.log(err)
    })
    
    session.getCloud()
    .then(() => console.log('student fetch cloud successful'))
    .catch(err => {
        console.log('student fetch cloud failed')
        console.log(err)
    })
    
    session.getDocuments()
    .then(() => console.log('student fetch documents successful'))
    .catch(err => {
        console.log('student fetch documents failed')
        console.log(err)
    })
    
    session.getSchoolOffice()
    .then(() => console.log('student fetch school office successful'))
    .catch(err => {
        console.log('student fetch school office failed')
        console.log(err)
    })
    
    session.searchMails(session.student.prenom)
    .then(() => console.log('student fetch search mails successful'))
    .catch(err => {
        console.log('student fetch search mails failed')
        console.log(err)
    })

})
.catch(err => {
    console.log('student login failed')
    console.log(err)
})

const parentAccount = new index.Account('ID', 'PASSWORD')

parentAccount.login()
.then(session => {
    console.log('parent login successful')
    
    session.getMails()
    .then(() => console.log('parent fetch mails successful'))
    .catch(err => {
        console.log('parent fetch mails failed')
        console.log(err)
    })
    
    session.getFinancialSituation()
    .then(() => console.log('parent fetch financial situation successful'))
    .catch(err => {
        console.log('parent fetch financial situation failed')
        console.log(err)
    })
    
    session.getInfo()
    .then(() => console.log('parent fetch info successful'))
    .catch(err => {
        console.log('parent fetch info failed')
        console.log(err)
    })
    
    session.getDocuments()
    .then(() => console.log('parent fetch documents successful'))
    .catch(err => {
        console.log('parent fetch documents failed')
        console.log(err)
    })

    let child = session.getChildren(0)
    if (child) {
        console.log('parent get child successful')
    } else {
        console.log('parent get child failed')
    }

})
.catch(err => {
    console.log('parent login failed')
    console.log(err)
})