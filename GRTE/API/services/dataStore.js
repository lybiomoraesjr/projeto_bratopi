// DataStore (file-based) is deprecated in favor of MongoDB/Mongoose.
// If any code still requires this file, it will throw an explicit error to avoid silent bugs.

module.exports = class DataStoreDeprecated {
    constructor() {
        throw new Error('DataStore is deprecated. Use MongoDB models (Mongoose) instead.')
    }
}
