const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
//const Tasks = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Not a valid email')
            }
        }

    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new Error('Password should not contain "password".')
            }
        }
    },
    tokens : [{
        token: {
            type:String,
            required: true
        }
    }],
    avatar : {
        type: Buffer
    }
}, {
    timestamps:true
})
userSchema.methods.toJSON =function () {

    const user = this.toObject()
    delete user.password
    delete user.tokens
    delete user.avatar
    return user
}

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({_id: this._id.toString()},JWT_SECRET)

    this.tokens = this.tokens.concat({token})
    this.save()
    return token

}

userSchema.statics.findByCredentials = async function(email,password)  {
    const user = await this.findOne({ email : email })
    if (!user) {
        throw new Error('Unable to Login!')
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if (!isMatch) {
        throw new Error('Unable to Login!')
    }
    return user
    
}

userSchema.virtual('tasks', {
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.pre('save', async function(next) {
    
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password,8)
    }
    next()
})

userSchema.pre('remove', async function(next) {
    await Tasks.deleteMany({owner: this._id})
    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User