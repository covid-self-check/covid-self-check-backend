import { OnCreateHandler, Patient } from "../../types"
import { admin } from "../../init"
import * as utils from "./utils"
import { statusListReverse } from "../../api/const"



export const onRegisterPatient: OnCreateHandler<Patient> = async (snapshot, _context) => {
  try {
    const batch = admin.firestore().batch();
    // snapshot.status
    const data = snapshot.data()
    utils.incrementTotalPatientCount(batch)

    utils.incrementTotalPatientCountByStatus(batch, statusListReverse[data.status])

    await batch.commit()

  } catch (e) {
    console.log(e)
  }
}



