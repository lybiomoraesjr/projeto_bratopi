const { Schema, model, Types } = require('mongoose')

const alunoSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String },
    cpf: { type: String, unique: true, sparse: true },
    matricula: { type: String, unique: true, sparse: true },
    turno: { type: String, enum: ['Matutino', 'Vespertino', 'Noturno'] },
    escola: { type: String },
    endereco: { type: String },
    telefone: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
})

module.exports = model('Aluno', alunoSchema)
