const Aluno = require('../models/alunos')

async function list(req, res, next) {
    try {
        const items = await Aluno.find().lean()
        res.json(items)
    } catch (err) { next(err) }
}

async function getById(req, res, next) {
    try {
        const id = req.params.id
        const item = await Aluno.findById(id).populate('rota').populate('parada').lean()
        if (!item) return res.status(404).json({ error: 'Aluno não encontrado' })
        res.json(item)
    } catch (err) { next(err) }
}

async function create(req, res, next) {
    try {
        const payload = req.body || {}
        if (!payload.name) return res.status(400).json({ error: 'Campo name obrigatório' })
        const created = await Aluno.create({
            name: payload.name,
            email: payload.email,
            cpf: payload.cpf,
            matricula: payload.matricula,
            turma: payload.turma,
            endereco: payload.endereco,
            telefone: payload.telefone,
            rota: payload.rota || null,
            parada: payload.parada || null
        })
        res.status(201).json(created)
    } catch (err) { next(err) }
}

async function update(req, res, next) {
    try {
        const id = req.params.id
        const existing = await Aluno.findById(id)
        if (!existing) return res.status(404).json({ error: 'Aluno não encontrado' })
        const body = req.body || {}
        existing.name = body.name !== undefined ? body.name : existing.name
        existing.email = body.email !== undefined ? body.email : existing.email
        existing.cpf = body.cpf !== undefined ? body.cpf : existing.cpf
        existing.matricula = body.matricula !== undefined ? body.matricula : existing.matricula
        existing.turma = body.turma !== undefined ? body.turma : existing.turma
        existing.endereco = body.endereco !== undefined ? body.endereco : existing.endereco
        existing.telefone = body.telefone !== undefined ? body.telefone : existing.telefone
        existing.rota = body.rota !== undefined ? body.rota : existing.rota
        existing.parada = body.parada !== undefined ? body.parada : existing.parada
        existing.updatedAt = new Date()
        await existing.save()
        res.json(existing)
    } catch (err) { next(err) }
}

async function remove(req, res, next) {
    try {
        const id = req.params.id
        const existing = await Aluno.findById(id)
        if (!existing) return res.status(404).json({ error: 'Aluno não encontrado' })
        await Aluno.deleteOne({ _id: id })
        res.status(204).end()
    } catch (err) { next(err) }
}

module.exports = { list, getById, create, update, remove }
