import express = require("express");
import { https } from "firebase-functions";

export type OnCallHandler<T> = (data: T, context: https.CallableContext) => any | Promise<any>
export type OnRequestHandler = (req: https.Request, resp: express.Response) => void | Promise<void>