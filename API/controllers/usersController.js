const User = require('../models/User')


async function list(req, res, next) {
    try {
        const users = await User.find().lean()
        res.json(users)
    } catch (err) { next(err) }
}

async function getById(req, res, next) {
    try {
        const id = req.params.id
        const user = await User.findById(id).lean()
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
        res.json(user)
    } catch (err) { next(err) }
}

async function create(req, res, next) {
    try {
        const payload = req.body
        if (!payload || !payload.name || !payload.email) {
            return res.status(400).json({ error: 'Campos name e email são obrigatórios' })
        }
        const created = await User.create({ name: payload.name, email: payload.email })
        res.status(201).json(created)
    } catch (err) { next(err) }
}

async function update(req, res, next) {
    try {
        const id = req.params.id
        const payload = req.body
        const existing = await User.findById(id)
        if (!existing) return res.status(404).json({ error: 'Usuário não encontrado' })
        existing.name = payload.name !== undefined ? payload.name : existing.name
        existing.email = payload.email !== undefined ? payload.email : existing.email
        existing.updatedAt = new Date()
        await existing.save()
        res.json(existing)
    } catch (err) { next(err) }
}

async function remove(req, res, next) {
    try {
        const id = req.params.id
        const existing = await User.findById(id)
        if (!existing) return res.status(404).json({ error: 'Usuário não encontrado' })
        await User.deleteOne({ _id: id })
        res.status(204).end()
    } catch (err) { next(err) }
}

module.exports = { list, getById, create, update, remove }
