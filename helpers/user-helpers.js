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
        return new Promise (async(resolve,reject)=>{
            userId=new objectId(userId);
            prodId=new objectId(prodId);
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:userId});
            if(userCart){
                db.get().collection(collection.CART_COLLECTION).updateOne(
                    {user:userId},{
                        $push:{products:prodId}
                    });

            }else{
                let cartObj={
                    user:userId,
                    products:[prodId]
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
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:new objectId(userId)}
                },
                {
                    $lookup: {
                        from: collection.PRODUCS_COLLECTIONS, // Should be "from" here
                        let: { prodList: '$products' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$_id', '$$prodList']
                                    }
                                }
                            }
                        ],
                        as: 'cartItems'
                    }
                }

            ]).toArray()
            resolve(cartItems)
        });
        
    }

}