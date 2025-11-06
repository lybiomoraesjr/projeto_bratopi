// Script to insert sample alunos into MongoDB
const db = require('../services/dbConnection')
const Aluno = require('../models/alunos')

async function seed() {
    try {
        await db.connect()
        console.log('Connected to MongoDB, inserting sample alunos...')
        const samples = [
            { name: 'Ana Silva', email: 'ana.silva@example.com', cpf: '11111111111', matricula: 'MTR1001', turno: 'Matutino', escola: 'Escola Municipal A', endereco: 'Rua A, 100', telefone: '11999990001' },
            { name: 'Bruno Souza', email: 'bruno.souza@example.com', cpf: '22222222222', matricula: 'MTR1002', turno: 'Vespertino', escola: 'Escola Estadual B', endereco: 'Rua B, 200', telefone: '11999990002' },
            { name: 'Carla Pereira', email: 'carla.pereira@example.com', cpf: '33333333333', matricula: 'MTR1003', turno: 'Noturno', escola: 'Colégio C', endereco: 'Rua C, 300', telefone: '11999990003' }
        ]
        for (const s of samples) {
            const exists = await Aluno.findOne({ matricula: s.matricula })
            if (!exists) {
                await Aluno.create(s)
                console.log('Inserted:', s.name)
            } else {
                console.log('Already exists, skipping:', s.matricula)
            }
        }
        console.log('Seed finished')
        process.exit(0)
    } catch (err) {
        console.error('Seed error:', err)
        process.exit(1)
    }
}

seed()
