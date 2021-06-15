const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req,res,next) => {
    try{
    const token = req.headers['authorization'].replace("Bearer ","")
    const decode = jwt.verify(token,'Thisismytoken')
    const user = await User.findOne({_id: decode._id, 'tokens.token': token})
    
    if (!user) {
        throw new Error()
    }
    req.user = user
    req.token = token
    console.log('Authenticated Succesfully!')
    next()
    } catch (e) {
    console.log(e)
        res.status(400).send('Please Authenticate')
    }

}

module.exports = auth