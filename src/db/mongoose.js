const mongoose = require('mongoose')

mongoose.connect(MONGODB_URL, {
    useNewUrlParser : true, 
    useCreateIndex: true
}).then((result)=> {
    console.log('Succesfully connected to mongoose!')
}).catch((error)=>{
    console.log('nable to connect')
})



