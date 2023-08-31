var express = require('express');
var router = express.Router();

/* GET Admin listing. */
router.get('/', function(req, res, next) {
  let products=[
    {
      name:"Iphone 14",
      category:"Mobile",
      description:"the best phone ever",
      Image:"https://img4.gadgetsnow.com/gd/images/products/additional/large/G390766_View_1/mobiles/smartphones/apple-iphone-14-128-gb-blue-6-gb-ram-.jpg"
    },
    {
      name:"Samsung Galaxy S22 Ultra",
      category:"Mobile",
      description:"Burgundy, 12GB, 256GB Storage",
      Image:"https://m.media-amazon.com/images/I/41QPv5h1veL._SX300_SY300_QL70_FMwebp_.jpg"
    },
    {
      name:"Nothing Phone (2)",
      category:"Mobile",
      description:"Dark Grey, 512 GB 12 GB RAM",
      Image:"https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/u/m/b/-original-imagrdefbw6bhbjr.jpeg?q=70"
    },
    {
      name:"Galaxy Z Flip5",
      category:"Mobile",
      description:"Special edition Available on samsung.com",
      Image:"https://img4.gadgetsnow.com/gd/images/products/additional/large/G390766_View_1/mobiles/smartphones/apple-iphone-14-128-gb-blue-6-gb-ram-.jpg"
    }
  ]


  res.render('admin/view-products',{admin:true, products})
});

// add product------------------------------------
router.get('/add-product',function(req,res){
  res.render('admin/add-product')
});
router.post('/add-product',function(req,res){
  console.log(req.body)
});


module.exports = router;
