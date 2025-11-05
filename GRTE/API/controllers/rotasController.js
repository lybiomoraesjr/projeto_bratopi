const Rota = require('../models/Rota')
const Parada = require('../models/Parada')

// rota structure: { _id, name, paradas: [ObjectId], createdAt }

async function list(req, res, next) {
    try {
        const items = await Rota.find().lean()
        res.json(items)
    } catch (err) { next(err) }
}

async function getById(req, res, next) {
    try {
        const id = req.params.id
        const rota = await Rota.findById(id).populate('paradas').lean()
        if (!rota) return res.status(404).json({ error: 'Rota não encontrada' })
        res.json(rota)
    } catch (err) { next(err) }
}

async function create(req, res, next) {
    try {
        const payload = req.body || {}
        if (!payload.name) return res.status(400).json({ error: 'Campo name obrigatório' })
        const item = await Rota.create({ name: payload.name, paradas: payload.paradas || [] })
        res.status(201).json(item)
    } catch (err) { next(err) }
}

async function update(req, res, next) {
    try {
        const id = req.params.id
        const existing = await Rota.findById(id)
        if (!existing) return res.status(404).json({ error: 'Rota não encontrada' })
        existing.name = req.body.name !== undefined ? req.body.name : existing.name
        existing.paradas = req.body.paradas !== undefined ? req.body.paradas : existing.paradas
        existing.updatedAt = new Date()
        await existing.save()
        res.json(existing)
    } catch (err) { next(err) }
}

async function remove(req, res, next) {
    try {
        const id = req.params.id
        const existing = await Rota.findById(id)
        if (!existing) return res.status(404).json({ error: 'Rota não encontrada' })
        await Rota.deleteOne({ _id: id })
        res.status(204).end()
    } catch (err) { next(err) }
}

async function getAllRotas(req, res, next) {
    try {
        const rotas = await Rota.find().lean()
        res.json(rotas)
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getAllRotas,
    list,
    getById,
    create,
    update,
    remove,
}
