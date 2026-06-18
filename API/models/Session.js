const { Schema, model } = require('mongoose')

const sessionSchema = new Schema({
    token: { type: String, required: true, unique: true },
    user: { email: String, name: String },
    createdAt: { type: Date, default: Date.now }
})

module.exports = model('Session', sessionSchema)
