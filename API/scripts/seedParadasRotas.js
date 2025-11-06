const db = require('../services/dbConnection')
const Parada = require('../models/Parada')
const Rota = require('../models/Rota')

async function seed() {
    try {
        await db.connect()

        const existingParadas = await Parada.find().lean()
        if (existingParadas.length === 0) {
            const paradasData = [
                { name: 'Parada Central', address: 'Praça Central, 100', lat: -23.55052, lng: -46.633308 },
                { name: 'Parada Escola A', address: 'Rua das Flores, 123', lat: -23.55100, lng: -46.634000 },
                { name: 'Parada Bairro B', address: 'Av. Principal, 456', lat: -23.55200, lng: -46.635000 },
                { name: 'Parada Terminal', address: 'Terminal Rodoviário, s/n', lat: -23.55300, lng: -46.636000 }
            ]
            const created = await Parada.insertMany(paradasData)
            console.log('Paradas criadas:', created.map(p => ({ id: p._id.toString(), name: p.name })))
        } else {
            console.log('Paradas já existentes, pulando criação. Count =', existingParadas.length)
        }

        // reload paradas to get ids
        const paradas = await Parada.find().lean()

        const existingRotas = await Rota.find().lean()
        if (existingRotas.length === 0) {
            // criar duas rotas de exemplo usando paradas existentes
            const now = new Date()
            const later = new Date(now.getTime() + 60 * 60 * 1000) // +1 hora

            const rotaData = [
                {
                    name: 'Rota A - Centro/Escola',
                    paradas: [paradas[0]._id, paradas[1]._id],
                    alunos: [],
                    dataHoraInicio: now,
                    dataHoraFim: later,
                    frequenciaDias: ['Segunda', 'Quarta', 'Sexta'],
                    status: 'ativa'
                },
                {
                    name: 'Rota B - Bairro/Terminal',
                    paradas: [paradas[2]._id, paradas[3]._id],
                    alunos: [],
                    dataHoraInicio: now,
                    dataHoraFim: later,
                    frequenciaDias: ['Terça', 'Quinta'],
                    status: 'ativa'
                }
            ]

            const createdRotas = await Rota.insertMany(rotaData)
            console.log('Rotas criadas:', createdRotas.map(r => ({ id: r._id.toString(), name: r.name })))
        } else {
            console.log('Rotas já existentes, pulando criação. Count =', existingRotas.length)
        }

        console.log('Seed de paradas e rotas finalizado.')
        process.exit(0)
    } catch (err) {
        console.error('Erro durante seed:', err)
        process.exit(1)
    }
}

seed()
