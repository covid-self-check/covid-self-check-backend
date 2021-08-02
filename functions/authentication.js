const { admin } = require('./init');
const axios = require('axios')

/**
 * Authenticate middleware for volunteer system
 * @param {*} func function to call if authenticate success
 * @returns error 401 if not authorized email
 */
exports.authenticateVolunteer = (func) => {
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


exports.getProfile = async (data) => {
    const { lineIDToken, userID } = data;

    const params = new URLSearchParams()
    params.append("client_id", functions.config().liff.channelid)
    params.append("id_token", lineIDToken)
    params.append("user_id", userID)

    const response = await axios.post('https://api.line.me/oauth2/v2.1/verify', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    console.log(response, 'res')

    const userProfile = { ...response }
    return userProfile
}