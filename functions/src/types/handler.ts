import { https } from "firebase-functions";

export type OnCallHandler<T> = (data: T, context: https.CallableContext) => any | Promise<any>