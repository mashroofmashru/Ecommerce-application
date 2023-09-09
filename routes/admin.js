var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers');

/* GET Admin listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{

    res.render('admin/view-products',{admin:true, products})

  });
  
});

// add product------------------------------------
router.get('/add-product',function(req,res){
  res.render('admin/add-product',{admin:true})
});

router.post('/add-product',function(req,res){
  console.log(req.body);
  console.log(req.files.image);

  productHelpers.addProducts(req.body,(id)=>{
    let image=req.files.Image;
    image.mv('./public/product-Images/'+id+'.jpg',(err,done)=>{
      if(!err){

        res.render('admin/add-product',{admin:true});

      }else{
        console.error(err);
        res.status(500).send("An error occurred while moving the uploaded image file");
      }

    });
  });
});


module.exports = router;
