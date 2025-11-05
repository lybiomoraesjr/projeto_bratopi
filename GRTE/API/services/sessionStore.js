// Deprecated: sessionStore (in-memory) replaced by MongoDB Session model.
// Keep a stub that throws to prevent accidental usage.

module.exports = {
    create() { throw new Error('sessionStore is deprecated; use Session model (MongoDB) instead') },
    get() { throw new Error('sessionStore is deprecated; use Session model (MongoDB) instead') },
    delete() { throw new Error('sessionStore is deprecated; use Session model (MongoDB) instead') }
}
