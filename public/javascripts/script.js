function addToCart(prodId) {

    $.ajax({
        url: '/add-to-cart/' + prodId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                let count = $('#cart-count').html();
                count = parseInt(count) + 1;
                $("#cart-count").html(count);
            }
            console.log(response);
        }
    })
} 

function changeQuantity(cartId,proId,count){
    let quantity=parseInt(document.getElementById(proId).innerHTML)
    count=parseInt(count)
    $.ajax({
        url:'/change-product-quantity',
        data:{
            cart:cartId,
            product:proId,
            count:count,
            quantity:quantity
        },
        method:'post',
        success:(response)=>{
            if(response.removeProduct){
                alert("Product Removed from cart")
                location.reload()
            }else{
                document.getElementById(proId).innerHTML=quantity+count
            }
        }

    })
}

// function removeProductFrmCart(){
    // $.ajax({

    // })
// }