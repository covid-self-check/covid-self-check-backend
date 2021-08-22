import * as functions from "firebase-functions";

export const config = {
  backupAccount: {
    clientEmail: functions.config().backup_account.client_email,
    privateKey: functions.config().backup_account.private_key,
  },
  line: {
    channelSecret: functions.config().line.channel_secret,
    channelAccessToken: functions.config().line.channel_token,
    r2rUri: functions.config().line.r2r_uri,
  },
  liff: {
    channelId: functions.config().liff.channelid,
  },
  region: functions.config().region.location,
  api: {
    authorization: functions.config().api.authorization
  }
};
