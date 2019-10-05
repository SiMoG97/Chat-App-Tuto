const generateMessage = (message,username)=> {
    return{
        message,
        createdAt : new Date().getTime(),
        username
    }
}

module.exports = {
    generateMessage
}