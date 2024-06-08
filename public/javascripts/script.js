var elements = document.getElementsByClassName("card-text");
for (var i = 0; i < elements.length; i++) {
    var fullText = elements[i].textContent;
    var trimmedText = fullText.split(/\s+/).slice(0, 15).join(" ");
    elements[i].textContent = trimmedText + '...';
}

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

function changeQuantity(cartId, proId, userId, count) {
    let quantity = parseInt(document.getElementById(proId).innerHTML);
    count = parseInt(count);
    $.ajax({
        url: '/change-product-quantity',
        data: {
            user: userId,
            cart: cartId,
            product: proId,
            count: count,
            quantity: quantity
        },
        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                alert("Product Removed from cart");
                location.reload();
            } else {
                document.getElementById(proId).innerHTML = quantity + count
                document.getElementById('total').innerHTML = response.total
            }
        }

    })
}

function deleteCartProduct(cartId, proId, userId) {
    var confirmation = confirm("Are you sure you want to remove this item?");
    if (confirmation) {
        $.ajax({
            url: '/delete-cart-products',
            data: {
                user: userId,
                cart: cartId,
                product: proId
            },
            method: 'post',
            success: (response) => {
                if (response.removeProduct) {
                    location.reload();
                }
            }
        })
    }
}

$("#checkout-form").submit((e) => {
    e.preventDefault();
    $.ajax({
        url: '/place-order',
        method: 'post',
        data: $('#checkout-form').serialize(),
        success: (response) => {
            if (response.codSuccess) {
                location.href = '/order-placed'
            } else {
                razorpayPayment(response);
            }
        }
    })
})

function razorpayPayment(order) {
    var options = {
        "key": "rzp_test_IvGWMBpENteAE2", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "ShopperHub",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {
            verifyPayment(response, order);
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9000090000"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}

function verifyPayment(payment, order) {
    $.ajax({
        url: '/verify-Payment',
        data: {
            payment,
            order
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                location.href = '/order-placed'
            } else {
                alert("Payment Failed");
            }

        }
    })

}


