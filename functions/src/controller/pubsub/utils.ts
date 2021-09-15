import { statusList } from "../../api/const";
import { admin, collection } from "../../init";

export const calculateHours = (currentDate: Date, lastUpdatedDate: Date) => {
  return Math.abs(currentDate.getTime() - lastUpdatedDate.getTime()) / 36e5;
};

export const getActiveUser = async () => {
  const snapshot = await admin.firestore().collection(collection.patient).get();

  const notUpdatedList = [];
  const currentDate = new Date();
  snapshot.forEach((doc) => {
    const patient = doc.data();

    const lastUpdatedDate = patient.lastUpdatedAt.toDate();
    const hours = calculateHours(currentDate, lastUpdatedDate)
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




