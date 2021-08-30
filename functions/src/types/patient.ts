import { Timestamp } from "@google-cloud/firestore"
import { HistoryType, RegisterType } from '../schema'

export type FollowUp = Omit<HistoryType, "noAuth" | "lineIDToken" | "lineUserID">

export type Patient = {
  followUp: FollowUp[]
  status: number
  needFollowUp: boolean
  createdDate: Timestamp
  lastUpdatedAt: Timestamp
  isRequestToCallExported: boolean
  isRequestToCall: boolean
  isNurseExported: boolean
  toAmed: number
} & Partial<FollowUp> & Omit<RegisterType, "noAuth" | "lineIDToken" | "lineUserID">