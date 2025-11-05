const { Schema, model, Types } = require('mongoose')

const rotaSchema = new Schema({
    name: { type: String, required: true },
    paradas: [{ type: Types.ObjectId, ref: 'Parada' }],
    alunos: [{ type: Types.ObjectId, ref: 'Aluno' }],
    dataHoraInicio: { type: Date, required: true },
    dataHoraFim: { type: Date, required: true },
    frequenciaDias: [{ type: String, enum: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'] }],
    status: { type: String, enum: ['ativa', 'inativa'], default: 'ativa' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
})

module.exports = model('Rota', rotaSchema)
