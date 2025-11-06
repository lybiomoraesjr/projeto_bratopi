const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');
const Session = require('../models/Session');
const User = require('../models/User');

// credenciais hardcoded conforme solicitado - REMOVIDO

const COOKIE_NAME = 'token';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // opcional: duração do cookie (em ms)
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
};

async function login(req, res, next) {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        // 1. Encontrar o usuário pelo email
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // 2. Comparar a senha fornecida com a senha hasheada no banco
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // 3. Criar a sessão
        const token = (typeof randomUUID === 'function') ? randomUUID() : String(Date.now());
        const sessionUser = { email: user.email, name: user.name };
        await Session.create({ token, user: sessionUser });

        // 4. Enviar o token como cookie e os dados do usuário no corpo
        res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
        res.json({ user: sessionUser });
    } catch (err) {
        next(err);
    }
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
