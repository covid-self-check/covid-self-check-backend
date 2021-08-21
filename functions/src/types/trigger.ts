import { QueryDocumentSnapshot } from "@google-cloud/firestore";
import { WriteBatch, DocumentSnapshot, DocumentReference, DocumentData } from "@google-cloud/firestore"
import { EventContext, Change } from "firebase-functions";

export type OnCreateHandler<T = DocumentData> = (snapshot: QueryDocumentSnapshot<T>, context: EventContext) => PromiseLike<any> | any
export type PatientCountHandler = (snapshot: DocumentSnapshot, ref: DocumentReference, batch: WriteBatch) => void
export type OnUpdateHandler<T = DocumentData> = (change: Change<QueryDocumentSnapshot<T>>, context: EventContext) => PromiseLike<any> | any