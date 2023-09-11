var db=require('../config/connection');
var collection=require('../config/collections');
module.exports={
    addProducts:(product,callback)=>{
        console.log(product);
        db.get().collection(collection.PRODUCS_COLLECTIONS).insertOne(product).then((data)=>{
            console.log(data)
            callback(data.insertedId);

        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCS_COLLECTIONS).find().toArray();
            resolve(products);
        })
    }
}