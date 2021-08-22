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

    await utils.incrementTotalPatientCountByStatus(batch, statusListReverse[data.status])

    await batch.commit()

  } catch (e) {
    console.log(e)
  }
}

export const onUpdatePatient: OnUpdateHandler = async (change, _context) => {
  try {
    const batch = admin.firestore().batch();

    const prevData = change.before.data() as Patient;
    const currentData = change.after.data() as Patient;

    // if the change is relevant to update symptom
    if (prevData.status !== currentData.status) {
      // decrement from old color
      await utils.decrementTotalPatientCountByStatus(batch, statusListReverse[prevData.status])

      // increment new color
      await utils.incrementTotalPatientCountByStatus(batch, statusListReverse[currentData.status])

      if (currentData.toAmed === 1) {
        await utils.decrementTotalPatientCount(batch);
      }
      await batch.commit();
    }

  } catch (e) {
    console.log(e)
  }
}

export const onDeletePatient: OnDeleteHandler = async (snapshot, _context) => {
  const data = snapshot.data() as Patient
  try {
    const batch = admin.firestore().batch();
    // if the patient is not sent to amed yet, 
    // additional decrement total patient count is required
    if (data.toAmed === 0) {
      await utils.decrementTotalPatientCount(batch);
    }

    await utils.decrementTotalPatientCountByStatus(batch, statusListReverse[data.status]);

    await utils.incrementTerminateUser(batch);

    await batch.commit()

  } catch (e) {
    console.log(e)
  }
}





