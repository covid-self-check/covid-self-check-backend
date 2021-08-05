const axios = require('axios')
const { calculateAge, formatDateTimeAPI } = require('../utils/date')
const functions = require('firebase-functions')
const URL = 'https://pedsanam.ydm.family/pedsanam/label_score'
const AUTHORIZATION = functions.config().api.authorization

exports.statusList = {
    unknown: 0,
    G1: 1,
    G2: 2,
    Y1: 3,
    Y2: 4,
    R1: 5,
    R2: 6,
}

exports.makeStatusAPIPayload = (data, lastFollowUp) => {
    const age = calculateAge(data.birthDate.toDate())
    const infected_discover_date = formatDateTimeAPI(data.createdDate)
    var payload = {
        age: age,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        infected_discover_date: infected_discover_date,
        sp_o2: lastFollowUp.sp_o2,
        sp_o2_ra: lastFollowUp.sp_o2_ra,
        sp_o2_after_eih: lastFollowUp.sp_o2_after_eih,
        eih_result: lastFollowUp.eih_result,
        sym1_severe_cough: lastFollowUp.sym1_severe_cough,
        sym1_chest_tightness: lastFollowUp.sym1_chest_tightness,
        sym1_poor_appetite: lastFollowUp.sym1_poor_appetite,
        sym1_fatigue: lastFollowUp.sym1_fatigue,
        sym1_persistent_fever: lastFollowUp.sym1_persistent_fever,
        rf_copd_chronic_lung_disease: data.rf_copd_chronic_lung_disease,
        rf_ckd_stage_3_to_4: data.rf_ckd_stagr_3_to_4,
        rf_chronic_heart_disease: data.rf_chronic_heart_disease,
        rf_cva: data.rf_cva,
        rf_t2dm: data.rf_t2dm,
        rf_cirrhosis: data.rf_cirrhosis,
        rf_immunocompromise: data.rf_immunocompromise,
        sym2_tired_body_ache: lastFollowUp.sym2_tired_body_ache,
        sym2_cough: lastFollowUp.sym2_cough,
        sym2_fever: lastFollowUp.sym2_fever,
        sym2_liquid_stool: lastFollowUp.sym2_liquid_stool,
        sym2_cannot_smell: lastFollowUp.sym2_cannot_smell,
        sym2_rash: lastFollowUp.sym2_rash,
        sym2_red_eye: lastFollowUp.sym2_red_eye,
        fac_diabetes: data.fac_diabetes,
        fac_dyslipidemia: data.fac_dyslipidemia,
        fac_hypertension: data.fac_hypertension,
        fac_esrd: data.fac_esrd,
        fac_cancer: data.fac_cancer,
        fac_tuberculosis: data.fac_tuberculosis,
        fac_hiv: data.fac_hiv,
        fac_asthma: data.fac_asthma,
        fac_pregnancy: data.fac_pregnancy,
        fac_bed_ridden_status: lastFollowUp.fac_bed_ridden_status,
        fac_uri_symptoms: lastFollowUp.fac_uri_symptoms,
        fac_diarrhea: lastFollowUp.fac_diarrhea,
        fac_dyspnea: lastFollowUp.fac_dyspnea,
        fac_gi_symptoms: lastFollowUp.fac_gi_symptoms,
    }

    var formBody = []
    for (var property in payload) {
        var encodedKey = encodeURIComponent(property)
        var encodedValue = encodeURIComponent(payload[property])
        formBody.push(encodedKey + '=' + encodedValue)
    }
    formBody = formBody.join('&')
    return formBody
}

exports.makeRequest = async (formPayload) => {
    try {
        const response = await axios.post(URL, formPayload, {
            headers: {
                Authorization: AUTHORIZATION,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        const data = response.data
        console.log('here')
        return {
            inclusion_label: data.inclusion_label,
            inclusion_label_type: data.inclusion_label_type,
            triage_score: data.triage_score,
        }
    } catch (e) {
        console.log('error:', e)
        return {
            inclusion_label: this.statusList.unknown,
            inclusion_label_type: 'at_least',
        }
    }
}
