require('dotenv').config()
const express = require('express')
const cors = require('cors')

const usersRouter = require('./routes/users')
const authRouter = require('./routes/auth')
const rotasRouter = require('./routes/rotas')
const paradasRouter = require('./routes/paradas')
const alunosRouter = require('./routes/alunos')
const db = require('./services/dbConnection')

const app = express()

app.use(cors({
    origin: 'http://localhost:3000', // ou o endereço do seu frontend
    credentials: true,
}));
app.use(express.json())

// connect to MongoDB before mounting routes
db.connect().catch(err => {
    console.error('Falha ao conectar no MongoDB:', err.message)
    process.exit(1)
})

// public
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)

// protected resources
app.use('/api/rotas', rotasRouter)
app.use('/api/paradas', paradasRouter)
app.use('/api/alunos', alunosRouter)

// health
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' })
})

// error handler
app.use((err, req, res, next) => {
    console.error(err)
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

const PORT = process.env.PORT || 3456
app.listen(PORT, () => {
    console.log(`API rodando na porta ${PORT}`)
})

module.exports = app
