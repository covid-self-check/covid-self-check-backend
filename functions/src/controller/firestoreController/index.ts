import { OnCreateHandler, OnUpdateHandler, Patient } from "../../types"
import { admin } from "../../init"
import * as utils from "./utils"
import { statusListReverse } from "../../api/const"



export const onRegisterPatient: OnCreateHandler<Patient> = async (snapshot, _context) => {
  try {
    const batch = admin.firestore().batch();
    // snapshot.status
    const data = snapshot.data()
    await utils.incrementTotalPatientCount(batch)

    await utils.incrementTotalPatientCountByStatus(batch, statusListReverse[data.status])

    await batch.commit()

  } catch (e) {
    console.log(e)
  }
}

export const onUpdatePatient: OnUpdateHandler<Patient> = async (change, context) => {
  try {
    const batch = admin.firestore().batch();

    const prevData = change.before.data();
    const currentData = change.after.data();

    // decrement from old color
    await utils.decrementTotalPatientCountByStatus(batch, statusListReverse[prevData.status])

    // increment new color

    await utils.incrementTotalPatientCountByStatus(batch, statusListReverse[currentData.status])

  } catch (e) {
    console.log(e)
  }
}




