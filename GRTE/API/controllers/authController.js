const { randomUUID } = require('crypto')
const Session = require('../models/Session')

// credenciais hardcoded conforme solicitado
const HARDCODED = { email: 'admin@example.com', password: '3456', name: 'Administrador' }

const COOKIE_NAME = 'token'
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // opcional: duração do cookie (em ms)
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body || {}
        if (email !== HARDCODED.email || String(password) !== String(HARDCODED.password)) {
            return res.status(401).json({ error: 'Credenciais inválidas' })
        }
        const user = { email: HARDCODED.email, name: HARDCODED.name }
        const token = (typeof randomUUID === 'function') ? randomUUID() : String(Date.now())
        await Session.create({ token, user })

        // define cookie HttpOnly com o token (não enviar o token no body)
        res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
        res.json({ user })
    } catch (err) { next(err) }
}

async function logout(req, res, next) {
    try {
        const auth = req.headers['authorization'] || ''
        let token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null

        // também suporta token em cookie (se middleware cookie-parser estiver instalado)
        if (!token && req.cookies && req.cookies[COOKIE_NAME]) {
            token = req.cookies[COOKIE_NAME]
        }

        if (token) await Session.deleteOne({ token })

        // limpar cookie do cliente
        res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS)
        res.status(204).end()
    } catch (err) { next(err) }
}

module.exports = { login, logout }
