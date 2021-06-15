const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')





router.get('/users/me', auth,  async (req,res) => {
    res.status(200).send(req.user)
})

router.post('/users/signup', async (req,res) => {
    const user = new User(req.body)
    try {
        await user.save()
        if (!user) {
            res.status(404).send()
        }
        const token = await user.generateAuthToken()
        res.status(200).send({user,token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req,res) => {
    try{
    const user = await User.findByCredentials(req.body.email, req.body.password)
    if (!user) {
        res.status(404).send()
    }
    const token = await user.generateAuthToken()
    res.status(200).send({user,token})
    } catch (e) {
        res.status(400).send('Please provide correct Username/Password!')
    }

})

router.post('/users/logout',auth,  async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token)=> {
            return token.token !== req.token
        })
        await req.user.save()
        res.status(200).send('Logged Out Succesfully!')
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll',auth,  async (req,res)=> {
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(200).send('Succesfully logged out of all accounts!')
    } catch (e){
        res.status(500).end()
    }
})

router.patch('/users/me',auth,  async (req,res) => {
    
    const allowedUpdates = ['name','age','email','password']
    const updates = Object.keys(req.body)
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if(!isValid) {
        return res.status(400).send('Invalid Updates!')
    }

    try{
        const user = req.user
        updates.forEach((update) => user[update] = req.body[update])
    await user.save()
    res.status(200).send(user)
    } catch (e) {
    res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req,res) => {
    try {
        req.user.remove()
        res.status(200).send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

const upload = multer({
    limits : {
        fileSize:1000000
    },
    fileFilter(req,file,cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb( new Error('Please provide a valid image!'))
        }
        cb(undefined,true)
    }
})

router.post('/users/me/avatars',auth, upload.single('avatar'), async (req,res)=> {

    const Buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar = Buffer

    await req.user.save()
    res.status(200).send('Uploaded')
} , (error,req,res,next) => {
    res.status(400).send({error:error.message})
})

router.delete('/users/me/avatars', auth, async (req,res)=> {
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send()
})

router.get('/users/:id/avatars',async (req,res)=> {
    try {
    const user = await User.findById(req.params.id)
    
    if (!user || !user.avatar) {
        throw new Error()
    }
    res.set('Content-Type', 'image/jpg')
    res.send(user.avatar)
} catch (e) {
    res.status(404).send()
}
})

module.exports = router