const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const User = require('../models/user')

const router = new express.Router()

router.get('/tasks',auth, async (req,res)=>{
    try {
        const match = {}
        const sort = {}
        if (req.query.status) {
            match.status = req.query.status === 'true'
        }
        if (req.query.sortBy) {

            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1]==='desc' ? -1 : 1
        }
        
        await req.user.populate({
            path : 'tasks',
            match,
            options : {
            limit : parseInt(req.query.limit),
            skip : parseInt(req.query.skip),
            sort}
        }).execPopulate()

         
    res.status(200).send(req.user.tasks)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.get('/tasks/:id',auth, async (req,res)=>{
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})



router.post('/tasks',auth,  async (req,res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})



router.patch('/tasks/:id',auth, async (req,res)=> {
    const allowedUpdates = ['Description','status']
    const updates = Object.keys(req.body)
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if (!isValid) {
        return res.status(404).send('Invalid Updates')
    }

    try {
        const task = await Task.findOne({_id:req.params.id, owner: req.user._id})
        if (!task) {
            return res.status(404).send('Task not found!')
        }
        updates.forEach((update) => {
            task[update] = req.body[update]
        })

        await task.save()

        return res.status(201).send(task)
    } catch (e) {
        console.log(e)
        return res.status(400).send(e)
    }

})



router.delete('/tasks/:id',auth, async (req,res) => {
    try{
        const task = await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id})
        if (!task) {
            return res.status(404).send('Invalid ID')
        }
        res.status(200).send(task)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

module.exports = router