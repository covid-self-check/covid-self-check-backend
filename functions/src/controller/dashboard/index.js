const { count } = require("console");
const { admin, collection } = require("../../init");
const { statusListReverse } =require("../../api/const");

exports.getAccumulative = async() => {
    const [g1,g2,r1,r2,y1,y2,users,unknown,legacyRef] = await Promise.all([getCount(collection.userCount,"G1"),getCount(collection.userCount,"G2"),getCount(collection.userCount,"R1"),getCount(collection.userCount,"R2"),getCount(collection.userCount,"Y1"),getCount(collection.userCount,"Y2"),getCount(collection.userCount,"users"),getCount(collection.userCount,"unknown"),getCount(collection.legacyStat,"stat")]);
    const temp = {
        G1: g1,
        G2: g2,
        R1: r1,
        R2: r2,
        Y1: y1,
        Y2: y2,
        users: users,
        unknown: unknown,
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

exports.resetUserCount = async() => {
    const batch = admin.firestore().batch();
    const docs = ["G1","G2","R1","R2","Y1","Y2","users","unknown"];
    const data = await getPatient();
    const tempdoc =  admin.firestore().collection(collection.userCount);
    const temps = await Promise.all([tempdoc.doc("G1").get(),tempdoc.doc("G2").get(),tempdoc.doc("R1").get(),tempdoc.doc("R2").get(),tempdoc.doc("Y1").get(),tempdoc.doc("Y2").get(),tempdoc.doc("users").get(),tempdoc.doc("unknown").get()]);
    let check = 0;
    docs.forEach((doc)=>{
        const docRef =  tempdoc.doc(doc);
        if(temps[check].exists){
            console.log("Update " + doc);
            batch.update(docRef,{count : data[doc]});
        }else{
            console.log("Create " + doc);
            batch.create(docRef,{count : data[doc]});
        }
        check++;
    });
    await batch.commit();
}

const getPatient = async() => {
    const snapshot = await admin.firestore().collection(collection.patient).get();
    let counts={
        G1: 0,
        G2: 0,
        R1: 0,
        R2: 0,
        Y1: 0,
        Y2: 0,
        users:0,
        unknown:0
    };
    snapshot.forEach((doc)=>{
        const count = doc.data();
        if(count.toAmed==0){
            counts.users += 1;
        }
        counts[statusListReverse[count.status]] += 1 ;
    });
    console.log(counts);
    return counts;  
}
