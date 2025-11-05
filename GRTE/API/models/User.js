const { Schema, model } = require('mongoose')

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
})

module.exports = model('User', userSchema)
