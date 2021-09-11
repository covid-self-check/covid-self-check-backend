import { admin } from "../init";
import axios, { AxiosError } from "axios";

import * as functions from "firebase-functions";
import { LineCredential, OnCallHandler } from "../types";

/**
 * Authenticate middleware for volunteer system
 * @param {*} func function to call if authenticate success
 * @returns error 401 if not authorized email
 */
export const authenticateVolunteer = (func: OnCallHandler): OnCallHandler => {
  return async (data, context) => {
    if (
      data.noAuth &&
      functions.config().environment &&
      functions.config().environment.isdevelopment
    ) {
      return await func(data, context);
    }
    if (!context.auth)
      return { status: "error", code: 401, message: "Not signed in" };
    const email = context.auth.token.email || null;
    const userInfo = await admin
      .firestore()
      .collection("volunteers")
      .where("email", "==", email)
      .get();
    if (userInfo.empty) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "ไม่มี permission"
      );
    }
    return await func(data, context);
  };
};

/**
 * Authenticate middleware for volunteer system (express)
 * @param {*} func function to call if authenticate success
 * @returns error 401 if not authorized email
 */
export function authenticateVolunteerRequest(func: any): any {
  return async (req: any, res: any) => {
    try {
      if (
        req.body.noAuth &&
        functions.config().environment &&
        functions.config().environment.isdevelopment
      ) {
        await func(req, res);
      }

      const tokenId = req.get("Authorization")!.split("Bearer ")[1];
      const decoded = await admin.auth().verifyIdToken(tokenId);
      const email = decoded.email || null;
      const userInfo = await admin
        .firestore()
        .collection("volunteers")
        .where("email", "==", email)
        .get();

      if (userInfo.empty) {
        res
          .status(401)
          .json({ status: "error", message: "Not authorized" });
        return;
      }
      try {
        await func(req, res);
      } catch (e) {
        console.log(e);
        res.status(500).json({ status: "error", message: "Unknown" });
      }
    } catch (e) {
      console.log(e);
      res
        .status(401)
        .json({ status: "error", message: "Not signed in" });
    }
  };
};

/**
 * Not a middlware, will consider refactor
 * @param {*} data
 * @returns
 */
export const getProfile = async (data: LineCredential) => {
  if (
    data.noAuth &&
    functions.config().environment &&
    functions.config().environment.isdevelopment
  ) {
    return { data: {}, error: false };
  }
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
    return { data: (e as AxiosError).response?.data, error: true };
  }
};
