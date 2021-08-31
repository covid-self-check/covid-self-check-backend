
import { WriteBatch, DocumentSnapshot, DocumentReference, QueryDocumentSnapshot } from "@google-cloud/firestore"
import { EventContext, Change } from "firebase-functions";

export type OnCreateHandler = (snapshot: QueryDocumentSnapshot, context: EventContext) => PromiseLike<any> | any
export type PatientCountHandler = (snapshot: DocumentSnapshot, ref: DocumentReference, batch: WriteBatch) => void
export type OnUpdateHandler = (change: Change<QueryDocumentSnapshot>, context: EventContext) => PromiseLike<any> | any
export type OnDeleteHandler = (snapshot: QueryDocumentSnapshot, context: EventContext) => PromiseLike<any> | any