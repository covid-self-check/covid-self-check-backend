const { admin } = require("../../init");

exports.setPatientStatus = (obj, createdDate) => {
  const needFollowUp = true;
  obj["status"] = 0;
  obj["needFollowUp"] = needFollowUp;
  obj["followUp"] = [];
  const createdTimestamp = admin.firestore.Timestamp.fromDate(createdDate);
  obj["createdDate"] = createdTimestamp;
  obj["lastUpdatedAt"] = createdTimestamp;
  obj["isRequestToCallExported"] = false;
  obj["isRequestToCall"] = false;
  obj["isNurseExported"] = false;
  obj["toAmed"] = 0;
};
