const mongoose = require('mongoose')

const tasksSchema = new mongoose.Schema({
    Description: {
        type: String,
        required: true,
        trim: true
    },
    status : {
        type: Boolean,
        default: false
    },
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    }
}, {
    timestamps:true
})



const Tasks = mongoose.model('Tasks',tasksSchema) 

module.exports = Tasks