var express = require('express');
const { describe } = require('node:test');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers');
var userHelpers=require('../helpers/user-helpers');
const    verifyLogin=(req,res,next)=>{
  if(req.session.userLoggedIn){
    next();
  }else{
      res.redirect('/login')
  }

}

/* GET home page. */
router.get('/',async function(req, res, next) {
  let user=req.session.user;
  let cartCount=null;
  if(user){
    cartCount=await userHelpers.getCartCount(req.session.user._id);
  }

  productHelpers.getAllProducts().then((products)=>{
    res.render('user/view-products',{products,user,cartCount});
  });

});

//user login-----------------------------------
router.get('/login',(req,res)=>{
  if(req.session.user){
    res.redirect('/')
  }else
  res.render('user/login',{"loginErr":req.session.userLoginErr})
  req.session.userLoginErr=false;
});

//user signup-----------------------------------
router.get('/signup',(req,res)=>{
  res.render('user/signup')
});

router.post('/signup',(req,res)=>{

  userHelpers.doSignup(req.body).then((response)=>{
    
    req.session.user=response;
    req.session.userLoggedIn=true;
    res.redirect('/');
  });
  
});

router.post('/login',(req,res)=>{

  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.user=response.user;
      req.session.userLoggedIn=true;
      res.redirect('/')
    }else{
      req.session.userLoginErr="Invalid username or password";
      res.redirect('/login')
    }
  });

});

//user logout-----------------------------------
router.get('/logout',(req,res)=>{

  req.session.user=null;
  res.redirect('/')

});

//user cart-----------------------------------
router.get('/cart',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id);
  let totalValue=0;
  if(products.length>0){
    totalValue=await userHelpers.getTotalAmount(req.session.user._id);
  }
  res.render('user/cart',{products,user:req.session.user,totalValue});

});

//add product on user cart-----------------------------------
router.get('/add-to-cart/:id',(req,res)=>{
  userHelpers.addToCart(req.params.id, req.session.user._id)
  .then(() => {
    res.json({ status: true });
  });
});

//Change product quantity-----------------------------------
router.post('/change-product-quantity',(req,res,next)=>{
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.body.user);
    res.json(response);
  })
})

// ---------------removeBtnactionRounter-----------
router.post('/delete-cart-products',(req,res)=>{
  userHelpers.deleteCartProduct(req.body).then(async(response)=>{
    res.json(response)
  })
})
// ---------------removeBtnactionRounter-----------

//placeOrder---------------------------------------
router.get('/place-order',verifyLogin,async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id);
  res.render('user/place-order',{total,user:req.session.user});
});

router.post('/place-order',async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId);
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId);
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true});
    }else{
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response)
      });
    }
    
  })
})

//OrderPlaced alert-----------------------------------
router.get('/order-placed',(req,res)=>{
  res.render('user/order-placed',{user:req.session.user});
})

//List Orders-----------------------------------------
router.get('/orders',async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id);
  res.render('user/orders',{user:req.session.user,orders});
})

//List OrderProducts-----------------------------------
router.get('/view-order-products/:id',async(req,res)=>{
  let products= await userHelpers.getOrderProducts(req.params.id);
  res.render('user/view-order-products',{user:req.session.user,products});
})

//Payment verification----------------------------------
router.post('/verify-Payment',(req,res)=>{
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentSatatus((req.body['order[receipt]'])).then(()=>{
      res.json({status:true});
    })
  }).catch((err)=>{
    res.json({status:false, errMsg:''});
  })
})

module.exports = router;
