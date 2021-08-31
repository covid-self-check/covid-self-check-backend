import { admin, collection } from "../../init"
import { statusList } from "../../api/const";
import { QuerySnapshot } from "@google-cloud/firestore";
import { Patient, NotUpdatedList, R2RAssistance, R2C, WithID } from "../../types";
import { Response } from "express";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";


export const streamXLSXFile = (
  res: Response,
  wb: XLSX.WorkBook,
  filename: string,
): void => {
  const opts: XLSX.WritingOptions = { bookType: "xlsx", type: "binary" };

  // it must be save to `/tmp` directory because it run on firebase
  const pathToSave = path.join("/tmp", filename)

  // write file
  XLSX.writeFile(wb, pathToSave, opts)

  // create read stream
  const stream = fs.createReadStream(pathToSave);

  // prepare http header
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  stream.pipe(res);
}


export const getUnExportedR2RUsers = () => {
  return admin
    .firestore()
    .collection(collection.r2rAssistance)
    .where("isR2RExported", "==", false)
    .get();
};

/**
 * @returns data of each snapshot with doc id included
 */
export const serializeData = (snapshot: QuerySnapshot) => {
  const result: any[] = [];
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    data.id = doc.id;
    result.push(data);
  });

  return result;
};

/**
 * marked users from R2R collection as exported
 */
export const updateExportedR2RUsers = (snapshot: QuerySnapshot<R2RAssistance>) => {
  return Promise.all(
    snapshot.docs.map((doc) => {
      const ref = admin
        .firestore()
        .collection(collection.r2rAssistance)
        .doc(doc.id);

      return ref.update({
        isR2RExported: true,
      });
    })
  );
};

export const getUnExportedR2CUsers = () => {
  return admin
    .firestore()
    .collection(collection.patient)
    .where("isRequestToCall", "==", true)
    .where("isRequestToCallExported", "==", false)
    .orderBy("lastUpdatedAt")
    .get();
};

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



/**
 * marked users from R2C collection as exported and return serialized data
 * @returns serialized snapshot data
 */
export const updateAndSerializeR2CData = async (snapshot: QuerySnapshot) => {
  const patientList: WithID<R2C>[] = [];
  await Promise.all(
    snapshot.docs.map((doc) => {
      // WARNING SIDE EFFECT inside map
      const data = doc.data() as R2C;
      const dataResult = makeR2CPayload(doc.id, data);
      patientList.push(dataResult);
      // end of side effects

      updateExportedR2CUser(doc.id);
    })
  );

  return patientList;
};

export const makeR2CPayload = (id: string, data: R2C) => {
  return {
    id,
    firstName: data.firstName,
    lastName: data.lastName,
    hasCalled: 0,
    personalPhoneNo: data.personalPhoneNo,
  };
};

export const updateExportedR2CUser = (id: string) => {
  const ref = admin.firestore().collection(collection.patient).doc(id);

  ref.update({
    isRequestToCallExported: true,
  });
};

export const formatterR2R = (doc: WithID<R2RAssistance>) => [doc.id, doc.name, doc.personalPhoneNo];

export const formatterR2C = (doc: WithID<R2C>) => [
  doc.id,
  doc.firstName,
  doc.hasCalled,
  `="${doc.personalPhoneNo}"`,
];

export const formatter36Hr = (doc: NotUpdatedList) => [doc.firstName, `="${doc.personalPhoneNo}"`]

export const formatPatient = (doc: Patient) => [
  doc.personalID,
  doc.firstName,
  doc.lastName,
  doc.personalPhoneNo,
  doc.emergencyPhoneNo,
]
