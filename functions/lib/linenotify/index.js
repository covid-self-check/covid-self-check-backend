"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const success_1 = require("../response/success");
const functions = require("firebase-functions");
exports.notifyToLine = async (message) => {
  try {
    const token = functions.config().linenotify.token;
    const params = new URLSearchParams();
    params.append("message", message);
    const response = await axios_1.default.post(
      "https://notify-api.line.me/api/notify",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return success_1.success();
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
};
//# sourceMappingURL=index.js.map
