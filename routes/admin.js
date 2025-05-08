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
router.get('/add-product',(req,res)=>{
  res.render('admin/add-product',{admin:true})
});

router.post('/add-product',(req,res)=>{
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

// Delete product------------------------------------
router.get('/delete-product/', (req, res) => {
  let prodId = req.query.id;
  productHelpers.deleteProducts(prodId).then((response) => {
    res.redirect('/admin/');
  });

});

// edit product------------------------------------
router.get('/edit-product/',async(req,res)=>{
  let product= await productHelpers.getProductDeatails(req.query.id);
  res.render('admin/edit-product',{product});

});

router.post('/edit-product',(req,res)=>{
  console.log(req.query.id);
  productHelpers.updateProduct(req.query.id,req.body).then(()=>{
    res.redirect('/admin');
    
    if(req.files.Image){
      let id=req.query.id;
      let image=req.files.Image;
      image.mv('./public/product-Images/'+id+'.jpg');
    }
  });
});

// list all order-------
router.get('/getAllOrders',async(req,res)=>{
  productHelpers.getAllOrders().then((orders)=>{
    res.render('admin/view-orders',{admin:true, orders});
  });
});

// list all users list-----------
router.get('/userList',async(req,res)=>{
  productHelpers.getAllUserList().then((users)=>{
    res.render('admin/view-userlist',{admin:true, users});
  });
});

//list banners -----------
router.get('/view-banners',(req,res)=>{
  productHelpers.viewBanner().then((banner)=>{
    res.render('admin/view-banners',{admin:true,banner});
  });
});

router.get('/add-banner',(req,res)=>{
  res.render('admin/add-banner');
});

router.post('/add-banner',(req,res)=>{
  console.log(req.body);
  console.log(req.files.image);

  productHelpers.addBanner(req.body).then((id)=>{
    let image=req.files.Image;
    image.mv('./public/banner-Images/'+id+'.jpg',(err,done)=>{
      if(!err){

        res.render('admin/add-banner',{admin:true});

      }else{
        console.error(err);
        res.status(500).send("An error occurred while moving the uploaded image file");
      }
    });
  });
});

router.get('/delete-banner/',(req,res)=>{
  let bannerId=req.query.id;
  productHelpers.deleteBanner(bannerId).then(()=>{
    res.redirect('/admin/view-banners');
  })
});
module.exports = router;
