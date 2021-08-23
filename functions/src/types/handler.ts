import * as express from "express";
import { EventContext, https } from "firebase-functions";


export type OnCallHandler<T = any> = (data: T, context: https.CallableContext) => any | Promise<any>
export type OnRequestHandler = (req: https.Request, resp: express.Response) => void | Promise<void>
export type OnRunHandler = (context: EventContext) => PromiseLike<any> | any
export type ExpressHandler = (req: express.Request, res: express.Response) => void | Promise<void>