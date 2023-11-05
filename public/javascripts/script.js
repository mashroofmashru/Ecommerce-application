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

function changeQuantity(cartId,proId,userId,count){
    let quantity=parseInt(document.getElementById(proId).innerHTML)
    count=parseInt(count)
    $.ajax({
        url:'/change-product-quantity',
        data:{
            user:userId,
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
                document.getElementById('total').innerHTML=response.total
            }
        }

    })
}

// function removeProductFrmCart(){
    // $.ajax({

    // })
// }

$("#checkout-form").submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/place-order',
        method:'post',
        data:$('#checkout-form').serialize(),
        success:(response)=>{
            if(response.status){
                location.href='/order-placed'
            }
        }
    })
})