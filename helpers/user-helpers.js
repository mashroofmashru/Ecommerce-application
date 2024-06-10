var db = require('../config/connection');
var collection = require('../config/collections');
const bcrypt = require('bcrypt');
var objectId = require("mongodb").ObjectId;
const Razorpay = require('razorpay');
const { resolve } = require('path');
var instance = new Razorpay({
    key_id: 'rzp_test_IvGWMBpENteAE2',
    key_secret: 'tH4vJwFji3WLnDms9bT9sPyL',
});

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)
            db.get().collection(collection.USER_COLLECTIONS).insertOne(userData).then((data) => {
                resolve(data);
            });
        });

    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTIONS).findOne({ Email: userData.Email });
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log('login successfull');
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    } else {
                        console.log('login failed');
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('login failed');
                resolve({ status: false })
            }
        });
    },
    getProducDetals:(prodId)=>{
        return new Promise(async(resolve,reject)=>{
            let product= await db.get().collection(collection.PRODUCS_COLLECTIONS).findOne({_id:new objectId(prodId)})
            resolve(product)
        })
    },
    addToCart: (prodId, userId) => {

        let proObj = {
            item: new objectId(prodId),
            quantity: 1
        }

        return new Promise(async (resolve, reject) => {
            userId = new objectId(userId);
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: userId });

            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == prodId)
                if (proExist != -1) {

                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: new objectId(userId), 'products.item': new objectId(prodId) },
                        {

                            $inc: { 'products.$.quantity': 1 }

                        }).then(() => {
                            resolve()
                        });

                } else {

                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: userId },
                        {

                            $push: { products: proObj }

                        }).then((response) => {
                            resolve();
                        });

                }


            } else {
                let cartObj = {
                    user: userId,
                    products: [proObj]
                }
                console.log(cartObj.user);
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                });

            }

        });

    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log("Fetching cart items for user ID:", userId)
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: new objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCS_COLLECTIONS,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray();
            resolve(cartItems);
        });

    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new objectId(userId) });

            if (cart) {
                count = cart.products.length;
            }

            resolve(count);

        });

    },
    changeProductQuantity: (details) => {
        count = parseInt(details.count)
        quantity = parseInt(details.quantity)
        console.log(count + "," + quantity);

        return new Promise((resolve, reject) => {
            if (count == -1 && quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: new objectId(details.cart) },
                        {
                            $pull: { products: { item: new objectId(details.product) } }

                        }).then((response) => {

                            resolve({ removeProduct: true })
                        })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: new objectId(details.cart), 'products.item': new objectId(details.product) },
                        {

                            $inc: { 'products.$.quantity': count }

                        }).then((response) => {
                            resolve({ status: true })
                        })
            }
        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log("Fetching cart items for user ID:", userId)
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: new objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCS_COLLECTIONS,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$product.Price' }] } }
                    }
                }

            ]).toArray();

            if(total[0].total){
                resolve(total[0].total);
            }else{
                resolve(total[0].total=0);
            }
        });

    },
    placeOrder: (order, products, total) => {
        return new Promise(async (resolve, reject) => {
            let status = order['payment-method'] === 'COD' ? 'placed' : 'pending';
            let orderObj = {
                deliveryDetails: {
                    mobile: order.mobile,
                    address: order.address,
                    pincode: order.pincode
                },
                userId: new objectId(order.userId),
                paymentMethod: order['payment-method'],
                products: products,
                totalAmount: total,
                date: new Date(),
                status: status
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: new objectId(order.userId) });
                console.log(response.insertedId);
                resolve(response.insertedId);    //response response.ops[0]._id
            })
        })

    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new objectId(userId) });
            resolve(cart.products);
        })
    },
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: new objectId(userId) }).toArray();
            console.log(orders);
            resolve(orders);
        })
    },
    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let OrderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: new objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCS_COLLECTIONS,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray();
            resolve(OrderItems);
        });
    },
    generateRazorpay: (orderId, totalAmount) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: totalAmount*100,
                currency: "INR",
                receipt: "" + orderId,
            };
            instance.orders.create(options, function (err, order) {
                console.log("New Order Details:");
                for (const key in order) {
                    if (order.hasOwnProperty(key)) {
                        console.log(`${key}:`, order[key]);
                    }
                }
                resolve(order);
            });
        });
    },
    verifyPayment:(psymentDetails)=>{
        return new Promise((resolve,reject)=>{
            const crypto = require('crypto');
            var hmac=crypto.createHmac('sha256','tH4vJwFji3WLnDms9bT9sPyL');
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
            hmac=hmac.digest('hex');
            if(hmac==details['payment[razorpay_signature]']){
                resolve();
            }else{
                reject();
            }
        });
    },
    changePaymentSatatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:new objectId(orderId)},
            {
                $set:{
                    status:'placed'
                }
            }).then(()=>{
                resolve();
            })
        })
    },
    deleteCartProduct:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: new objectId(details.cart) },
                        {
                            $pull: { products: { item: new objectId(details.product) } }

                        }).then((response) => {
                            resolve({ removeProduct: true })
                        })
        })
    }
}