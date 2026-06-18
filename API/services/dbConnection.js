const mongoose = require('mongoose')

async function connect(uri) {
    const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/api_grte'
    mongoose.set('strictQuery', false)
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('MongoDB conectado em', mongoUri)
}

module.exports = { connect, mongoose }
