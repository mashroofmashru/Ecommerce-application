var express = require('express');
const { describe } = require('node:test');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers');
var userHelpers=require('../helpers/user-helpers');

/* GET home page. */
router.get('/', function(req, res, next) {
  let user=req.session.user;

  productHelpers.getAllProducts().then((products)=>{
    res.render('user/view-products',{products,user});
  });

});

router.get('/login',(req,res)=>{
  res.render('user/login')
});


router.get('/signup',(req,res)=>{
  res.render('user/signup')
});

router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response)
  });
});

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.logged=true;
      req.session.user=response.user;
      res.redirect('/')
    }else{
      res.redirect('/login')
    }

  });

});

router.get('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect('/')

});

module.exports = router;
