const { RSA_X931_PADDING } = require("constants");
const { admin, collection } = require("../../init");

exports.getAccumulative = async() => {
    const typeDocs = ["G1","G2","R1","R2","Y1","Y2","users"];
    const tempNum = [];
    for(let i=0; i<typeDocs.length;i++){
        const docRef = await admin
          .firestore()
          .collection(collection.userCount)
          .doc(typeDocs[i])
          .get();
        
        console.log(typeDocs[i]);
        tempNum.push(docRef.data());         
    };

    const legacyRef = await admin
      .firestore()
      .collection(collection.legacyStat)
      .doc("stat")
      .get();

    const temp = {
        G1:tempNum[0],
        G2:tempNum[1],
        R1:tempNum[2],
        R2:tempNum[3],
        Y1:tempNum[4],
        Y2:tempNum[5],
        users:tempNum[6],
        legacyCount: legacyRef.data().count
    };
    return temp;
    
};