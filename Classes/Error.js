class Error{
    constructor(error){
        this.Code = error.code 
        this.Token = null
        this.Message = error.message
    }
}

module.exports = Error