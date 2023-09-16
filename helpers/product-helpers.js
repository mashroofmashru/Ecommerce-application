var db=require('../config/connection');
var collection=require('../config/collections');
var ObjectId = require("mongodb").ObjectId;

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
    },
    deleteProducts:(prodId)=>{
        return new Promise((resolve,reject)=>{
            console.log("proId:",prodId)
            db.get().collection(collection.PRODUCS_COLLECTIONS).deleteOne({ _id:new ObjectId(prodId) }).then((response)=>{
                resolve(response);
            });
        });

    }
}