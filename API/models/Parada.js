const { Schema, model } = require('mongoose')

const paradaSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
})

paradaSchema.virtual('id').get(function idVirtual() {
    return this._id.toHexString()
})

const transform = (_, ret) => {
    delete ret._id
    return ret
}

paradaSchema.set('toJSON', { virtuals: true, versionKey: false, transform })
paradaSchema.set('toObject', { virtuals: true, versionKey: false, transform })

module.exports = model('Parada', paradaSchema)
