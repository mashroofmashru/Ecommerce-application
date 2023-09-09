var express = require('express');
const { describe } = require('node:test');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')

/* GET home page. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{

    res.render('user/view-products',{products});

  });

});

module.exports = router;
