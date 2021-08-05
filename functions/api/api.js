const axios = require("axios");
const FormData = require('form-data');
const { calculateAge,formatDateTimeAPI } = require("./date");

const URL = 'https://pedsanam.ydm.family/pedsanam/label_score';
const AUTHORIZATION = '6f7a633733a4699b374355a744606b61';

exports.makeStatusAPIPayload = (data)=>{
    const form = new FormData();
    const { followUp } = data;
    const lastFollowUp = followUp[followUp.length - 1];
    
    const age = calculateAge(data.birthDate.toDate());
    const infected_discover_date = formatDateTimeAPI(data.createdDate);

    form.append("age",age);
    form.append("gender", data.gender);
    form.append("height", data.height);
    form.append("weight", data.weight);
    form.append("infected_discover_date", infected_discover_date);
    form.append("sp_o2", lastFollowUp.sp_o2);
    form.append("sp_o2_ra", lastFollowUp.sp_o2_ra);
    form.append("sp_o2_after_eih", lastFollowUp.sp_o2_after_eih);
    form.append("eih_result", lastFollowUp.eih_result);
    form.append("sym1_severe_cough", lastFollowUp.sym1_severe_cough);
    form.append("sym1_chest_tightness", lastFollowUp.sym1_chest_tightness);
    form.append("sym1_poor_appetite", lastFollowUp.sym1_poor_appetite);
    form.append("sym1_fatigue", lastFollowUp.sym1_fatigue);
    form.append("sym1_persistent_fever", lastFollowUp.sym1_persistent_fever);
    form.append("rf_copd_chronic_lung_disease", data.rf_copd_chronic_lung_disease);
    form.append("rf_ckd_stage_3_to_4", data.rf_ckd_stagr_3_to_4);
    form.append("rf_chronic_heart_disease", data.rf_chronic_heart_disease);
    form.append("rf_cva", data.rf_cva);
    form.append("rf_t2dm", data.rf_t2dm);
    form.append("rf_cirrhosis", data.rf_cirrhosis);
    form.append("rf_immunocompromise", data.rf_immunocompromise);
    form.append("sym2_tired_body_ache", lastFollowUp.sym2_tired_body_ache);
    form.append("sym2_cough", lastFollowUp.sym2_cough);
    form.append("sym2_fever", lastFollowUp.sym2_fever);
    form.append("sym2_liquid_stool", lastFollowUp.sym2_liquid_stool);
    form.append("sym2_cannot_smell", lastFollowUp.sym2_cannot_smell);
    form.append("sym2_rash", lastFollowUp.sym2_rash);
    form.append("sym2_red_eye", lastFollowUp.sym2_red_eye);
    form.append("fac_diabetes", data.fac_diabetes);
    form.append("fac_dyslipidemia", data.fac_dyslipidemia);
    form.append("fac_hypertension", data.fac_hypertension);
    form.append("fac_esrd", data.fac_esrd);
    form.append("fac_cancer", data.fac_cancer);
    form.append("fac_tuberculosis", data.fac_tuberculosis);
    form.append("fac_hiv", data.fac_hiv);
    form.append("fac_asthma", data.fac_asthma);
    form.append("fac_pregnancy", data.fac_pregnancy);
    form.append("fac_bed_ridden_status", lastFollowUp.fac_bed_ridden_status);
    form.append("fac_uri_symptoms", lastFollowUp.fac_uri_symptoms);
    form.append("fac_diarrhea", lastFollowUp.fac_diarrhea);
    form.append("fac_dyspnea", lastFollowUp.fac_dyspnea);
    form.append("fac_gi_symptomss", lastFollowUp.fac_gi_symptomss);
    return form;

}

exports.makeRequest = (payload)=>{
    try{
        const response = await axios.post(
            URL,
            payload,
            {
                headers: {
                  "Authorization": AUTHORIZATION,
                },
              }
        )
    }catch(e){

    }
}