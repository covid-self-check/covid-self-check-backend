const requestCall = async (data) => {
    const { value, error } = getProfileSchema.validate(data);
    if (error) {
        console.log(error.details);
        throw new functions.https.HttpsError(
            "failed-precondition",
            "ข้อมูลไม่ถูกต้อง",
            error.details
        );
    }

    const { lineUserID, lineIDToken, noAuth } = value;
    const { error: authError } = await getProfile({
        lineUserID,
        lineIDToken,
        noAuth,
    });

    if (authError) {
        throw new functions.https.HttpsError("unauthenticated", "ไม่ได้รับอนุญาต");
    }

    const snapshot = await admin
        .firestore()
        .collection("patient")
        .doc(lineUserID)
        .get();
    if (!snapshot.exists) {
        liff.init()

        liff.openWindow({
            url: "https://csc-staging.vercel.app/requestHelp",
            external: false
        });

        return success();

        // throw new functions.https.HttpsError(
        //     "not-found",
        //     `ไม่พบผู้ใช้ ${lineUserID}`
        // );
    }

    const { isRequestToCall } = snapshot.data();

    if (isRequestToCall) {
        return success(`userID: ${lineUserID} has already requested to call`);
    }

    await snapshot.ref.update({
        isRequestToCall: true,
        isRequestToCallExported: false,
    });
    return success();
}
module.exports = { requestCall };