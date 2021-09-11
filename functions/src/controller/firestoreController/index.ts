import { OnCreateHandler, OnUpdateHandler, OnDeleteHandler, Patient } from "../../types"
import { admin } from "../../init"
import * as utils from "./utils"
import { statusListReverse } from "../../api/const"



export const onRegisterPatient: OnCreateHandler = async (snapshot, _context) => {
  try {
    const batch = admin.firestore().batch();
    // snapshot.status
    const data = snapshot.data() as Patient
    await utils.incrementTotalPatientCount(batch)

    await utils.incrementTotalPatientCountByStatus(batch, statusListReverse[data.followUp[data.followUp.length - 1].status])

    await batch.commit()

  } catch (e) {
    console.log(e)
  }
}

export const onUpdatePatient: OnUpdateHandler = async (change, _context) => {
  try {
    const batch = admin.firestore().batch();

    const prevData = change.before.data() as Patient;
    const prevStatus = prevData.followUp[prevData.followUp.length - 1].status;


    const currentData = change.after.data() as Patient;
    const currentStatus = currentData.followUp[currentData.followUp.length - 1].status;

    // if the change is relevant to update symptom
    if (prevStatus !== currentStatus) {
      // decrement from old color
      await utils.decrementTotalPatientCountByStatus(batch, statusListReverse[prevStatus])

      // increment new color
      await utils.incrementTotalPatientCountByStatus(batch, statusListReverse[currentStatus])
      await batch.commit();
    }

  } catch (e) {
    console.log(e)
  }
}

export const onDeletePatient: OnDeleteHandler = async (snapshot, _context) => {
  const data = snapshot.data() as Patient
  const currentStatus = data.followUp[data.followUp.length - 1].status;
  try {
    const batch = admin.firestore().batch();

    await utils.decrementTotalPatientCountByStatus(batch, statusListReverse[currentStatus]);

    await utils.incrementTerminateUser(batch);

    await batch.commit()

  } catch (e) {
    console.log(e)
  }
}





