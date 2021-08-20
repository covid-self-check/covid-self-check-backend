import { https } from "firebase-functions";
import * as express from 'express';

export type request = https.Request;
export type response = express.Response;
// export type retur = ((req: https.Request, resp: express.Response) => void | Promise<void>)