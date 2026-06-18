const { Types } = require('mongoose')
const Rota = require('../models/Rota')

const DIA_SEMANA_ENUM = new Set(['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'])
const DIAS_DA_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const FREQUENCIA_PRESETS = {
    daily: [...DIAS_DA_SEMANA],
    weekdays: DIAS_DA_SEMANA.slice(0, 5),
    weekends: DIAS_DA_SEMANA.slice(5),
}
const STATUS_ALIASES = new Map([
    ['ativa', 'ativa'],
    ['active', 'ativa'],
    ['inativa', 'inativa'],
    ['inactive', 'inativa'],
    ['daily', 'ativa'],
    ['weekdays', 'ativa'],
    ['weekends', 'ativa'],
])

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

function parseTimeOfDay(value, fieldName, required = false) {
    if (value === undefined || value === null || value === '') {
        if (required) {
            return { error: `Campo ${fieldName} obrigatório` }
        }
        return { data: undefined }
    }
    if (typeof value !== 'string') {
        return { error: `Campo ${fieldName} inválido` }
    }
    const [hoursPart, minutesPart] = value.trim().split(':')
    const hours = Number(hoursPart)
    const minutes = Number(minutesPart)
    if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return { error: `Campo ${fieldName} inválido` }
    }
    const date = new Date()
    date.setSeconds(0, 0)
    date.setHours(hours, minutes)
    return { data: date }
}

function parseDateWithFallback(datetimeValue, timeValue, fieldName, required = false) {
    if (datetimeValue !== undefined && datetimeValue !== null && datetimeValue !== '') {
        return parseDate(datetimeValue, fieldName, required)
    }
    return parseTimeOfDay(timeValue, fieldName, required)
}

function parseFrequenciaDias(values, fallbackPeriodicity) {
    const result = []
    const sources = []
    if (values !== undefined) sources.push(values)
    if (fallbackPeriodicity !== undefined) sources.push(fallbackPeriodicity)

    for (const source of sources) {
        if (!source) continue
        const data = Array.isArray(source) ? source : [source]
        for (const raw of data) {
            if (typeof raw !== 'string') continue
            const value = raw.trim()
            if (DIA_SEMANA_ENUM.has(value)) {
                result.push(value)
                continue
            }
            const preset = FREQUENCIA_PRESETS[value]
            if (preset) {
                result.push(...preset)
            }
        }
    }

    if (!result.length) {
        return []
    }

    const unique = []
    for (const dia of result) {
        if (!unique.includes(dia)) unique.push(dia)
    }
    return unique
}

function normalizeStatus(value) {
    if (typeof value !== 'string') return undefined
    const normalized = STATUS_ALIASES.get(value.trim().toLowerCase())
    return normalized
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

        const timeValueInicio = payload.startTime ?? payload.horarioInicio ?? payload.horaInicio
        
        const inicioResult = parseDateWithFallback(
            payload.dataHoraInicio,
            timeValueInicio,
            'dataHoraInicio',
            true
        )
        if (inicioResult.error) return res.status(400).json({ error: inicioResult.error })

        const timeValueFim = payload.endTime ?? payload.horarioFim ?? payload.horaFim
        
        const fimResult = parseDateWithFallback(
            payload.dataHoraFim,
            timeValueFim,
            'dataHoraFim',
            true
        )
        if (fimResult.error) return res.status(400).json({ error: fimResult.error })

        const frequenciaDias = parseFrequenciaDias(payload.frequenciaDias, payload.periodicity)
        const status = normalizeStatus(payload.status) || 'ativa'

        const rotaData = {
            name: payload.name,
            paradas: paradasResult.data,
            alunos: alunosResult.data,
            dataHoraInicio: inicioResult.data,
            dataHoraFim: fimResult.data,
            frequenciaDias,
            status,
        }
        
        const item = await Rota.create(rotaData)
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

        const shouldUpdateInicio = req.body.dataHoraInicio !== undefined || req.body.startTime !== undefined || req.body.horarioInicio !== undefined || req.body.horaInicio !== undefined
        if (shouldUpdateInicio) {
            const inicioResult = parseDateWithFallback(
                req.body.dataHoraInicio,
                req.body.startTime ?? req.body.horarioInicio ?? req.body.horaInicio,
                'dataHoraInicio',
                true
            )
            if (inicioResult.error) return res.status(400).json({ error: inicioResult.error })
            existing.dataHoraInicio = inicioResult.data
        }

        const shouldUpdateFim = req.body.dataHoraFim !== undefined || req.body.endTime !== undefined || req.body.horarioFim !== undefined || req.body.horaFim !== undefined
        if (shouldUpdateFim) {
            const fimResult = parseDateWithFallback(
                req.body.dataHoraFim,
                req.body.endTime ?? req.body.horarioFim ?? req.body.horaFim,
                'dataHoraFim',
                true
            )
            if (fimResult.error) return res.status(400).json({ error: fimResult.error })
            existing.dataHoraFim = fimResult.data
        }

        const shouldUpdateFrequencia = req.body.frequenciaDias !== undefined || req.body.periodicity !== undefined
        if (shouldUpdateFrequencia) {
            existing.frequenciaDias = parseFrequenciaDias(req.body.frequenciaDias, req.body.periodicity)
        }

        if (req.body.status !== undefined) {
            const nextStatus = normalizeStatus(req.body.status)
            if (!nextStatus) return res.status(400).json({ error: 'Status inválido' })
            existing.status = nextStatus
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
