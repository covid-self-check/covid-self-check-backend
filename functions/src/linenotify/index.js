import axios from "axios";
import { success } from "../response/success";
import * as functions from "firebase-functions";

exports.notifyToLine = async (message) => {
  try {
    const token = functions.config().linenotify.token;
    const params = new URLSearchParams();
    params.append("message", message);
    const response = await axios.post(
      "https://notify-api.line.me/api/notify",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return success();
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
};
