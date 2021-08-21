import { QueryDocumentSnapshot } from "@google-cloud/firestore";
import { WriteBatch, DocumentSnapshot, DocumentReference } from "@google-cloud/firestore"
import { EventContext } from "firebase-functions";

export type OnCreateHandler<T> = (snapshot: QueryDocumentSnapshot<T>, context: EventContext) => PromiseLike<any> | any
export type PatientCountHandler = (snapshot: DocumentSnapshot, ref: DocumentReference, batch: WriteBatch) => void