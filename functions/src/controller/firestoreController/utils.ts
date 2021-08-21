
import { admin, collection } from "../../init"
import { WriteBatch } from "@google-cloud/firestore"
import { PatientCountHandler } from "../../types"


export const incrementTotalPatientCount = async (batch: WriteBatch) => {
  const docRef = admin
    .firestore()
    .collection(collection.userCount)
    .doc("users")

  const snapshot = await docRef.get()

  createOrIncrementCount(snapshot, docRef, batch)
}

export const decrementTotalPatientCount = async (batch: WriteBatch) => {
  const docRef = admin
    .firestore()
    .collection(collection.userCount)
    .doc("users")

  const snapshot = await docRef.get()

  decrementCount(snapshot, docRef, batch)
}

export const incrementTotalPatientCountByStatus = async (batch: WriteBatch, label: string) => {
  const docRef = admin
    .firestore()
    .collection(collection.userCount)
    .doc(label)

  const snapshot = await docRef.get()

  createOrIncrementCount(snapshot, docRef, batch)
}

export const decrementTotalPatientCountByStatus = async (batch: WriteBatch, label: string) => {
  const docRef = admin
    .firestore()
    .collection(collection.userCount)
    .doc(label)

  const snapshot = await docRef.get()

  decrementCount(snapshot, docRef, batch)

}


const createOrIncrementCount: PatientCountHandler = (snapshot, ref, batch) => {
  if (!snapshot.exists) {
    batch.create(ref, { count: 1 })
  } else {
    batch.update(ref, "count", admin.firestore.FieldValue.increment(1))
  }
}

const decrementCount: PatientCountHandler = (snapshot, ref, batch) => {
  if (snapshot.exists) {
    batch.update(ref, "count", admin.firestore.FieldValue.increment(-1))
  }
}