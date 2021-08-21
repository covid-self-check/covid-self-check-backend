const { get36hrsUsers } = require("../exportController/utils");
const { statusList } = require("../../api/const");

exports.calculateHours = (currentDate, lastUpdatedDate) => {
  return Math.abs(currentDate - lastUpdatedDate) / 36e5;
};

exports.getnumberusersbtw36hrsto72hrs = async () => {
  const temp_notUpdatedList = await get36hrsUsers();
  return temp_notUpdatedList.length;
};

exports.getActiveUser = async ()=>{
  const snapshot = await admin.firestore().collection(collection.patient).get();

  const notUpdatedList = [];
  const currentDate = new Date();
  snapshot.forEach((doc) => {
    const patient = doc.data();

    const lastUpdatedDate = patient.lastUpdatedAt.toDate();
    var hours = Math.abs(currentDate - lastUpdatedDate) / 36e5;
    const includeStatus = [
      statusList["unknown"],
      statusList["G1"],
      statusList["G2"],
    ];

    if (includeStatus.includes(patient.status)) {
      if (hours <= 36) {
        notUpdatedList.push({
          firstName: patient.firstName,
          personalPhoneNo: patient.personalPhoneNo,
        });
      }
    }
  });
  return notUpdatedList.length;
}


