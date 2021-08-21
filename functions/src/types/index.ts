import { EventContext, https } from "firebase-functions";
import * as express from 'express';
import { QueryDocumentSnapshot } from "@google-cloud/firestore";
import { WriteBatch, DocumentSnapshot, DocumentReference } from "@google-cloud/firestore"
import { Patient } from "./patient"

export type request = https.Request;
export type response = express.Response;
// export type retur = ((req: https.Request, resp: express.Response) => void | Promise<void>)


export type OnCreateHandler = (snapshot: QueryDocumentSnapshot<Patient>, context: EventContext) => PromiseLike<any> | any
export type PatientCountHandler = (snapshot: DocumentSnapshot, ref: DocumentReference, batch: WriteBatch) => void