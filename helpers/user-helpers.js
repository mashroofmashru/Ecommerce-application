var db=require('../config/connection');
var collection=require('../config/collections');
const bcrypt=require('bcrypt');
var objectId = require("mongodb").ObjectId;

module.exports={
    doSignup:(userData)=>{
        return new Promise (async(resolve,reject)=>{
            userData.Password=await bcrypt.hash(userData.Password,10)
            db.get().collection(collection.USER_COLLECTIONS).insertOne(userData).then((data)=>{
                resolve(data);
            });
        });

    },
    doLogin:(userData)=>{
        return new Promise (async(resolve,reject)=>{
            let loginStatus=false;
            let response={};
            let user=await db.get().collection(collection.USER_COLLECTIONS).findOne({Email:userData.Email});
            if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if(status){
                        console.log('login successfull');
                        response.user=user;
                        response.status=true;
                        resolve(response);
                    }else{
                        console.log('login failed');
                        resolve({status:false})
                    }
                })
            }else{
                console.log('login failed');
                resolve({status:false})
            }
        });
    },
    addToCart:(prodId,userId)=>{

        let proObj={
            item:new objectId(prodId),
            quantity:1
        }

        return new Promise (async(resolve,reject)=>{
            userId=new objectId(userId);
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:userId});
            
            if(userCart){
                let proExist=userCart.products.findIndex(product=> product.item==prodId)
                if(proExist!=-1){
                    
                    db.get().collection(collection.CART_COLLECTION).updateOne({'products.item':new objectId(prodId)},
                        {

                            $inc:{'products.$.quantity':1}
                        
                        }).then(()=>{
                            resolve()
                        });

                }else{

                    db.get().collection(collection.CART_COLLECTION).updateOne({user:userId},
                        {

                            $push:{products:proObj}

                        }).then((response)=>{
                            resolve();
                        });

                }
                

            }else{
                let cartObj={
                    user:userId,
                    products:[proObj]
                }
                console.log(cartObj.user);
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                });

            }

        });

    },
    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log("Fetching cart items for user ID:", userId)
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:new objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCS_COLLECTIONS,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                } 

            ]).toArray();
            resolve(cartItems);
        });
        
    },
    getCartCount:(userId)=>{
        return new Promise (async(resolve,reject)=>{    
            let count = 0;
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new objectId(userId) });

            if (cart) {
                count = cart.products.length;
            }

            resolve(count);

        });

    }

}