import { statusList } from "../../api/const";
import { admin, collection } from "../../init";
import { NotUpdatedList, Patient } from "../../types";

export const calculateHours = (currentDate: Date, lastUpdatedDate: Date) => {
  return Math.abs(currentDate.getTime() - lastUpdatedDate.getTime()) / 36e5;
};

export const getnumberusersbtw36hrsto72hrs = async () => {
  const temp_notUpdatedList = await get36hrsUsers();
  return temp_notUpdatedList.length;
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

export const get36hrsUsers = async () => {
  const snapshot = await admin.firestore().collection(collection.patient).get();

  const notUpdatedList: NotUpdatedList[] = [];
  snapshot.forEach((doc) => {
    const patient = doc.data() as Patient;

    const lastUpdatedDate = patient.lastUpdatedAt.toDate();
    const hours = Math.abs(new Date().getTime() - lastUpdatedDate.getTime()) / 36e5;
    const includeStatus = [
      statusList["unknown"],
      statusList["G1"],
      statusList["G2"],
    ];

    if (includeStatus.includes(patient.status)) {
      if (hours >= 36 && hours < 72) {
        notUpdatedList.push({
          firstName: patient.firstName,
          personalPhoneNo: patient.personalPhoneNo,
        });
      }
    }
  });
  return notUpdatedList;
};


