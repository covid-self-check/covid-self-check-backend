const { admin } = require('../init');

/**
 * Authenticate middleware
 * @param {*} func function to call if authenticate success
 * @returns error 401 if not authorized email
 */
exports.authenticate = (func) => {
    return async (data, context) => {
        if (!context.auth) return { status: 'error', code: 401, message: 'Not signed in' }
        const email = context.auth.token.email || null;
        const userInfo = await admin.firestore().collection('volunteers').where("email", "==", email).get();
        if (userInfo.empty) {
            return { status: 'error', code: 401, message: 'Not signed in' }
        }
        return await func(data, context)
    }
}