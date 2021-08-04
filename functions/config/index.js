const functions = require("firebase-functions");

exports.config = {
  backupAccount: {
    clientEmail: functions.config().backup_account.client_email,
    privateKey: functions.config().backup_account.private_key,
  },
  line: {
    channelSecret: functions.config().line.channel_secret,
    channelAccessToken: functions.config().line.channel_token,
  },
  liff: {
    channelId: functions.config().liff.channelid,
  },
  region: functions.config().region.location,
};