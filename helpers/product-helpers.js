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
    },
    getAllOrders:()=>{
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray();

            // Format the date to dd/mm/yyyy
            orders = orders.map(order => {
                const date = new Date(order.date);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                const year = date.getFullYear();
                order.date = `${day}/${month}/${year}`;
                return order;
            });
            console.log(orders);
            resolve(orders);
        });
    }
}