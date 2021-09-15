import axios from "axios";
import * as functions from "firebase-functions";
import * as _ from "lodash";
import { FollowUp } from "../types";
import { statusList } from "./const";
const URL = "https://pedsanam.ydm.family/pedsanam/label_score";
const AUTHORIZATION = functions.config().api.authorization;

export const makeStatusAPIPayload = (lastFollowUp: FollowUp) => {

  const payload = {
    age: lastFollowUp.age,
    gender: lastFollowUp.gender,
    height: lastFollowUp.height,
    weight: lastFollowUp.weight,
    // infected_discover_date: infected_discover_date,
    sp_o2: (lastFollowUp.sp_o2 || 100) / 100,
    sp_o2_ra: (lastFollowUp.sp_o2_ra || 100) / 100,
    sp_o2_after_eih: (lastFollowUp.sp_o2_after_eih || 100) / 100,
    eih_result: lastFollowUp.eih_result,
    sym1_severe_cough: lastFollowUp.sym1_severe_cough,
    sym1_chest_tightness: lastFollowUp.sym1_chest_tightness,
    sym1_poor_appetite: lastFollowUp.sym1_poor_appetite,
    sym1_fatigue: lastFollowUp.sym1_fatigue,
    sym1_persistent_fever: lastFollowUp.sym1_persistent_fever,
    rf_copd_chronic_lung_disease: lastFollowUp.rf_copd_chronic_lung_disease,
    rf_ckd_stage_3_to_4: lastFollowUp.rf_ckd_stagr_3_to_4,
    rf_chronic_heart_disease: lastFollowUp.rf_chronic_heart_disease,
    rf_cva: lastFollowUp.rf_cva,
    rf_t2dm: lastFollowUp.rf_t2dm,
    rf_cirrhosis: lastFollowUp.rf_cirrhosis,
    rf_immunocompromise: lastFollowUp.rf_immunocompromise,
    sym2_tired_body_ache: lastFollowUp.sym2_tired_body_ache,
    sym2_cough: lastFollowUp.sym2_cough,
    sym2_fever: lastFollowUp.sym2_fever,
    sym2_liquid_stool: lastFollowUp.sym2_liquid_stool,
    sym2_cannot_smell: lastFollowUp.sym2_cannot_smell,
    sym2_rash: lastFollowUp.sym2_rash,
    sym2_red_eye: lastFollowUp.sym2_red_eye,
    fac_diabetes: lastFollowUp.fac_diabetes,
    fac_dyslipidemia: lastFollowUp.fac_dyslipidemia,
    fac_hypertension: lastFollowUp.fac_hypertension,
    fac_esrd: lastFollowUp.fac_esrd,
    fac_cancer: lastFollowUp.fac_cancer,
    fac_tuberculosis: lastFollowUp.fac_tuberculosis,
    fac_hiv: lastFollowUp.fac_hiv,
    fac_asthma: lastFollowUp.fac_asthma,
    fac_pregnancy: lastFollowUp.fac_pregnancy,
    fac_bed_ridden_status: lastFollowUp.fac_bed_ridden_status,
    fac_uri_symptoms: lastFollowUp.fac_uri_symptoms,
    fac_diarrhea: lastFollowUp.fac_diarrhea,
    fac_dyspnea: lastFollowUp.fac_dyspnea,
    fac_gi_symptoms: lastFollowUp.fac_gi_symptoms,
  };

  const formBody = [];
  for (const [property, value] of _.entries(payload)) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(value);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  return formBody.join("&");
};

export const makeRequest = async (formPayload: string) => {
  try {
    const response = await axios.post(URL, formPayload, {
      headers: {
        "API-KEY": AUTHORIZATION,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const data = response.data;
    return {
      inclusion_label: data.inclusion_label,
      inclusion_label_type: data.inclusion_label_type,
      triage_score: data.triage_score,
    };
  } catch (e) {
    console.log("error:", e);
    return {
      inclusion_label: statusList.unknown,
      inclusion_label_type: "at_least",
    };
  }
};
