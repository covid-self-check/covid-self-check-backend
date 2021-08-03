const { admin } = require("../init");
const axios = require("axios");
const functions = require("firebase-functions");

/**
 * Authenticate middleware for volunteer system
 * @param {*} func function to call if authenticate success
 * @returns error 401 if not authorized email
 */
exports.authenticateVolunteer = (func) => {
  return async (data, context) => {
    if (!context.auth)
      return { status: "error", code: 401, message: "Not signed in" };
    const email = context.auth.token.email || null;
    const userInfo = await admin
      .firestore()
      .collection("volunteers")
      .where("email", "==", email)
      .get();
    if (userInfo.empty) {
      return { status: "error", code: 401, message: "Not signed in" };
    }
    return await func(data, context);
  };
};

/**
 * Not a middlware, will consider refactor
 * @param {*} data
 * @returns
 */
exports.getProfile = async (data) => {
  const { lineIDToken, lineUserID } = data;

  const params = new URLSearchParams();
  params.append("client_id", functions.config().liff.channelid);
  params.append("id_token", lineIDToken);
  params.append("user_id", lineUserID);

  try {
    const response = await axios.post(
      "https://api.line.me/oauth2/v2.1/verify",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const userProfile = response.data;
    return { data: userProfile, error: false };
  } catch (e) {
    return { data: e.response.data, error: true };
  }
};
