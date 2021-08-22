const { admin, collection } = require("../../init");

exports.getAccumulative = async() => {
    const [g1,g2,r1,r2,y1,y2,users,unknown,legacyRef] = await Promise.all([getCount(collection.userCount,"G1"),getCount(collection.userCount,"G2"),getCount(collection.userCount,"R1"),getCount(collection.userCount,"R2"),getCount(collection.userCount,"Y1"),getCount(collection.userCount,"Y2"),getCount(collection.userCount,"users"),getCount(collection.userCount,"unknown"),getCount(collection.legacyStat,"stat")]);
    const temp = {
        G1:g1,
        G2:g2,
        R1:r1,
        R2:r2,
        Y1:y1,
        Y2:y2,
        users:users,
        unknown:unknown,
        legacyCount: legacyRef
    };
    return temp;
};

const getCount = async(collection, document) =>{
    const docRef = await admin
          .firestore()
          .collection(collection)
          .doc(document)
          .get();
    if(docRef.exists){
        return docRef.data().count;
    }else{
        return 0;
    }
}