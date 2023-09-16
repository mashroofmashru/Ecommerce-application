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
            db.get().collection(collection.PRODUCS_COLLECTIONS).deleteOne({ _id:new ObjectId(prodId) }).then((response)=>{
                resolve(response);
            });
        });

    },
    getProductDeatails:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCS_COLLECTIONS).findOne({_id:new ObjectId(prodId)}).then((product)=>{
                resolve(product);
            });
        });
    },
    updateProduct:(prodId,product)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCS_COLLECTIONS).updateOne({_id:new ObjectId(prodId)},{
                $set:{
                    Name:product.Name,
                    Category:product.Category,
                    Price:product.Price,
                    Description:product.Description

                }
            }).then((response)=>{
                resolve()
            });
        });
    }
}