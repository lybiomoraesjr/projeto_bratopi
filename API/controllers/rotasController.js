const { Types } = require('mongoose')
const Rota = require('../models/Rota')

const DIA_SEMANA_ENUM = new Set(['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'])

function coerceObjectId(value) {
    if (typeof value !== 'string') return null
    return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null
}

function parseObjectIdArray(values, fieldName) {
    if (!Array.isArray(values)) {
        return { error: `${fieldName} deve ser um array` }
    }
    const converted = values.map(coerceObjectId).filter(Boolean)
    if (converted.length !== values.length) {
        return { error: `${fieldName} contém identificadores inválidos` }
    }
    return { data: converted }
}

function parseDate(value, fieldName, required = false) {
    if (value === undefined || value === null || value === '') {
        if (required) {
            return { error: `Campo ${fieldName} obrigatório` }
        }
        return { data: undefined }
    }
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return { error: `Campo ${fieldName} inválido` }
    }
    return { data: date }
}

function parseFrequenciaDias(values) {
    if (!values) return []
    const data = Array.isArray(values) ? values : [values]
    return data.filter(dia => typeof dia === 'string' && DIA_SEMANA_ENUM.has(dia))
}

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
        const paradasResult = parseObjectIdArray(payload.paradas || [], 'paradas')
        if (paradasResult.error) return res.status(400).json({ error: paradasResult.error })

        const alunosResult = parseObjectIdArray(payload.alunos || [], 'alunos')
        if (alunosResult.error) return res.status(400).json({ error: alunosResult.error })

        const inicioResult = parseDate(payload.dataHoraInicio, 'dataHoraInicio', true)
        if (inicioResult.error) return res.status(400).json({ error: inicioResult.error })

        const fimResult = parseDate(payload.dataHoraFim, 'dataHoraFim', true)
        if (fimResult.error) return res.status(400).json({ error: fimResult.error })

        const frequenciaDias = parseFrequenciaDias(payload.frequenciaDias)

        const item = await Rota.create({
            name: payload.name,
            paradas: paradasResult.data,
            alunos: alunosResult.data,
            dataHoraInicio: inicioResult.data,
            dataHoraFim: fimResult.data,
            frequenciaDias,
            status: typeof payload.status === 'string' ? payload.status : undefined
        })
        res.status(201).json(item)
    } catch (err) { next(err) }
}

async function update(req, res, next) {
    try {
        const id = req.params.id
        const existing = await Rota.findById(id)
        if (!existing) return res.status(404).json({ error: 'Rota não encontrada' })

        if (req.body.name !== undefined) existing.name = req.body.name

        if (req.body.paradas !== undefined) {
            const paradasResult = parseObjectIdArray(req.body.paradas, 'paradas')
            if (paradasResult.error) return res.status(400).json({ error: paradasResult.error })
            existing.paradas = paradasResult.data
        }

        if (req.body.alunos !== undefined) {
            const alunosResult = parseObjectIdArray(req.body.alunos, 'alunos')
            if (alunosResult.error) return res.status(400).json({ error: alunosResult.error })
            existing.alunos = alunosResult.data
        }

        if (req.body.dataHoraInicio !== undefined) {
            const inicioResult = parseDate(req.body.dataHoraInicio, 'dataHoraInicio', true)
            if (inicioResult.error) return res.status(400).json({ error: inicioResult.error })
            existing.dataHoraInicio = inicioResult.data
        }

        if (req.body.dataHoraFim !== undefined) {
            const fimResult = parseDate(req.body.dataHoraFim, 'dataHoraFim', true)
            if (fimResult.error) return res.status(400).json({ error: fimResult.error })
            existing.dataHoraFim = fimResult.data
        }

        if (req.body.frequenciaDias !== undefined) {
            existing.frequenciaDias = parseFrequenciaDias(req.body.frequenciaDias)
        }

        if (req.body.status !== undefined && typeof req.body.status === 'string') {
            existing.status = req.body.status
        }

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
