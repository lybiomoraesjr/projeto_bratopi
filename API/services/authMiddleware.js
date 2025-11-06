const Session = require('../models/Session')

function parseTokenFromCookieHeader(cookieHeader, cookieName = 'token') {
    if (!cookieHeader) return null
    // cookieHeader example: "token=abc; other=xyz"
    const parts = cookieHeader.split(';').map(p => p.trim())
    for (const part of parts) {
        if (part.startsWith(cookieName + '=')) {
            return decodeURIComponent(part.slice((cookieName + '=').length))
        }
    }
    return null
}

async function authMiddleware(req, res, next) {
    try {
        // 1) Bearer token in Authorization header
        const auth = req.headers['authorization']
        let token = null
        if (auth && auth.startsWith('Bearer ')) {
            token = auth.slice('Bearer '.length)
        }

        // 2) If not found, try cookie header parsing (no cookie-parser dependency required)
        if (!token && req.headers && req.headers.cookie) {
            token = parseTokenFromCookieHeader(req.headers.cookie, 'token')
        }

        if (!token) return res.status(401).json({ error: 'Unauthorized' })

        const session = await Session.findOne({ token }).lean()
        if (!session) return res.status(401).json({ error: 'Invalid token' })
        req.user = session.user
        next()
    } catch (err) { next(err) }
}

module.exports = authMiddleware
