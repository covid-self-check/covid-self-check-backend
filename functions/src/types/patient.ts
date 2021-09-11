import { Timestamp } from "@google-cloud/firestore"
import { HistoryType, RegisterType } from '../schema'

export type FollowUp = Omit<HistoryType, "noAuth" | "lineIDToken" | "lineUserID">

export type Patient = Partial<FollowUp> & {
  followUp: FollowUp[]
  status: number
  needFollowUp: boolean
  createdDate: Timestamp
  lastUpdatedAt: Timestamp
  isRequestToCallExported: boolean
  isRequestToCall: boolean
  isNurseExported: boolean
  toAmed: number
  birthDate: Timestamp
} & Omit<RegisterType, "noAuth" | "lineIDToken" | "lineUserID" | "birthDate">


export type UpdatedPatient = {
  status: number
  triage_score: number
  status_label_type: string
  lastUpdatedAt: Timestamp
  createdDate: Timestamp
} & Partial<FollowUp>