import express = require("express");
import { EventContext, https } from "firebase-functions";

export type OnCallHandler<T> = (data: T, context: https.CallableContext) => any | Promise<any>
export type OnRequestHandler = (req: https.Request, resp: express.Response) => void | Promise<void>
export type OnRunHandler = (context: EventContext) => PromiseLike<any> | any