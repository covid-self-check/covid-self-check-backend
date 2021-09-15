import { Timestamp } from "@google-cloud/firestore"
import { HistoryType } from '../schema'

export type FollowUp = Omit<HistoryType, "noAuth" | "lineIDToken" | "lineUserID">

export type Patient = {
  followUp: UpdatedPatient[]
}

export type UpdatedPatient = {
  status: number
  triage_score: number
  status_label_type: string
  lastUpdatedAt: Timestamp
  createdDate: Timestamp
} & Partial<FollowUp>