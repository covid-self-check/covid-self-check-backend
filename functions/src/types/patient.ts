import { Timestamp } from "@google-cloud/firestore"

enum Gender {
  male = "male",
  female = "female",
  unknown = "unknown"
}

export type Patient = {
  firstName: string
  lastName: string

  birthDate: Timestamp
  weight: number
  height: number
  gender: Gender

  address: string
  province: string
  prefecture: string
  district: string
  postNo: string

  personalPhoneNo: string
  emergencyPhoneNo: string

  hasHelper: boolean
  digitalLiteracy: string

  gotFavipiravir: number

  // โรคประจำตัว
  rf_copd_chronic_lung_disease: number

  rf_ckd_stagr_3_to_4: number
  rf_chronic_heart_disease: number
  rf_cva: number
  rf_t2dm: number,
  rf_cirrhosis: number
  rf_immunocompromise: number

  fac_diabetes: number
  fac_dyslipidemia: number
  fac_hypertension: number
  fac_heart_diseases: number
  fac_esrd: number
  fac_cancer: number
  fac_tuberculosis: number
  fac_hiv: number
  fac_asthma: number
  fac_pregnancy: number
  // optional
  personalID: string
  passport: string

  dose1Name: string | null
  dose1Date: Timestamp | null
  dose2Name: string | null
  dose2Date: Timestamp | null
  favipiraviaAmount: number


  // additional 
  followUp: FollowUp[]
  status: number
  needFollowUp: boolean
  createdDate: Timestamp
  lastUpdatedAt: Timestamp
  isRequestToCallExported: boolean
  isRequestToCall: boolean
  isNurseExported: boolean
  toAmed: number


  // destructors from follow up
  sp_o2: number,
  sp_o2_ra: number,
  sp_o2_after_eih: number,
  eih_result: EIHResult
  sym1_severe_cough: number,
  sym1_chest_tightness: number,
  sym1_poor_appetite: number,
  sym1_fatigue: number,
  sym1_persistent_fever: number,

  sym2_tired_body_ache: number,
  sym2_cough: number,
  sym2_fever: number,
  sym2_liquid_stool: number,
  sym2_cannot_smell: number,
  sym2_rash: number,
  sym2_red_eye: number,

  fac_bed_ridden_status: number,
  fac_uri_symptoms: number,
  fac_olfactory_symptoms: number,
  fac_diarrhea: number,
  fac_dyspnea: number,
  fac_chest_discomfort: number,
  fac_gi_symptoms: number,


}

enum EIHResult {
  positive = "positive",
  negative = "negative",
  neutral = "neutral",
  unknown = "unknown"
}

export type FollowUp = {
  sp_o2: number,
  sp_o2_ra: number,
  sp_o2_after_eih: number,
  eih_result: EIHResult
  sym1_severe_cough: number,
  sym1_chest_tightness: number,
  sym1_poor_appetite: number,
  sym1_fatigue: number,
  sym1_persistent_fever: number,

  sym2_tired_body_ache: number,
  sym2_cough: number,
  sym2_fever: number,
  sym2_liquid_stool: number,
  sym2_cannot_smell: number,
  sym2_rash: number,
  sym2_red_eye: number,

  fac_bed_ridden_status: number,
  fac_uri_symptoms: number,
  fac_olfactory_symptoms: number,
  fac_diarrhea: number,
  fac_dyspnea: number,
  fac_chest_discomfort: number,
  fac_gi_symptoms: number,

}