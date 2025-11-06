const Parada = require('../models/Parada')

function parseCoordinate(value) {
    if (value === undefined || value === null || value === '') return null
    const number = Number(value)
    return Number.isFinite(number) ? number : null
}

async function list(req, res, next) {
    try {
        const items = await Parada.find().lean({ virtuals: true })
        res.json(items)
    } catch (err) { next(err) }
}

async function getById(req, res, next) {
    try {
        const id = req.params.id
        const item = await Parada.findById(id).lean({ virtuals: true })
        if (!item) return res.status(404).json({ error: 'Parada não encontrada' })
        res.json(item)
    } catch (err) { next(err) }
}

async function create(req, res, next) {
    try {
        const payload = req.body || {}
        if (!payload.name) return res.status(400).json({ error: 'Campo name obrigatório' })
        const data = {
            name: payload.name,
            address: payload.address || null,
            lat: parseCoordinate(payload.lat),
            lng: parseCoordinate(payload.lng)
        }
        const created = await Parada.create(data)
        res.status(201).json(created.toJSON())
    } catch (err) { next(err) }
}

async function update(req, res, next) {
    try {
        const id = req.params.id
        const existing = await Parada.findById(id)
        if (!existing) return res.status(404).json({ error: 'Parada não encontrada' })
        if (req.body.name !== undefined) existing.name = req.body.name
        if (req.body.address !== undefined) existing.address = req.body.address
        if (req.body.lat !== undefined) existing.lat = parseCoordinate(req.body.lat)
        if (req.body.lng !== undefined) existing.lng = parseCoordinate(req.body.lng)
        existing.updatedAt = new Date()
        await existing.save()
        res.json(existing.toJSON())
    } catch (err) { next(err) }
}

async function remove(req, res, next) {
    try {
        const id = req.params.id
        const existing = await Parada.findById(id)
        if (!existing) return res.status(404).json({ error: 'Parada não encontrada' })
        await Parada.deleteOne({ _id: id })
        res.status(204).end()
    } catch (err) { next(err) }
}

module.exports = { list, getById, create, update, remove }
