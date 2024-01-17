const { Category } = require("../models/CategorySchema");
const { Address } = require("../models/addressSchema");
const { Cart } = require("../models/cartSchema");
const { Orders } = require("../models/orderSchema");
const Razorpay = require('razorpay');
const dotenv = require('dotenv');
const { Product } = require("../models/productShema");
const { Wallet } = require("../models/walletSchema");
const { Transaction } = require("../models/walletTransactionSchema");
dotenv.config();

var instance = new Razorpay({
  key_id: process.env.secret_id,
  key_secret:process.env.secret
});


const getCategory = async function () {
    try {
      const categories = await Category.find({active: true});
      if (categories.length > 0) {
        return categories;
      } else {
        throw new Error("Couldn't find categories");
      }
    } catch (error) {
      console.log(error.message);
    }
};


module.exports.addressAndPaymentAjax = async(req,res)=>{
    try {
       const {payment ,addressIndex,totalPrice, totalPay} = req.body;

       console.log(addressIndex + "😒👌👌👌👌👌👌👌👌👌👌👌👌")
       const userId = req.session.user._id
        
        const address = await Address.findOne({userId: userId});
        const cart = await Cart.findOne({userId: userId}).populate('items.product');
        console.log(address + "😊😊😊😊😊😊😊😊😊😊😊😊😊😊😊😊😊🙌🙌");


        const newOrderAddress = address.addresses[addressIndex];

        const prodDetails = cart.items.map((item) => ({
            name: item.product.title,
            price: item.product.price,
            prodId: item.product._id,
            image: item.product.images[0].url,
            totalPrice: totalPrice,
            totalPaid: totalPay,
            quantity: item.quantity,
        }));
      
        console.log(newOrderAddress + "😊😊😊😊😊😊😊😊😊😊😊😊😊😊😊😊😊🙌🙌");
        const newOrder = new Orders({
            userId: userId,
            items: prodDetails, 
            address: newOrderAddress,
            totalPrice: totalPrice,
            totalPaid: totalPay,
            paymentMethod: payment
        }); 
        console.log(newOrder)
        const neworderSave = await newOrder.save()
        if(neworderSave){
        res.send({order: neworderSave})
        }else{
            console.log('error saving new order');
        }
    } catch (error) {
        console.log(error.message)
    }
}

// <-------------------------------------------------------| AJAX POST REQUEST FOR PAYMENT INTEGRATION --------------------------------|>
module.exports.PaymentCheckout = async(req,res)=>{
  
  try {
    const orderId = req.body.orderId;
  
    console.log('Order Id ' + orderId)

    const newOrder = await Orders.findById(orderId);
    console.log('Order' + newOrder + "⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔🔥");
    var options = {
      amount: newOrder.totalPrice * 100,  // amount in the smallest currency unit
      currency: "INR",
      receipt: "razorUser@gmail.com"
    };
    instance.orders.create(options, function(err, order) {
  
      console.log(order);
      res.send(order)
  
    });
  } catch (error) {
    console.log('Try catch error in PaymentCheckout  🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
  
}
  
module.exports.verifyPayment = async (req, res) => {
    try {
      console.log(req.body, "Success of order 📀📀📀📀📀📀😁😁❤️❤️");
      const orderId = req.body.orderId;
      const details = req.body

      console.log(orderId)
      console.log(details, "👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌😍😍😍");
  
      const secretKey = process.env.secret; 
      const crypto = require("crypto"); 
  
  
      const hmac = crypto.createHmac("sha256", secretKey);
      hmac.update(
        details.payment.razorpay_order_id +
          "|" +
          details.payment.razorpay_payment_id
      );
      const calculatedHmac = hmac.digest("hex");
  
      console.log(calculatedHmac, "HMAC calculated");
  
      if (calculatedHmac === details.payment.razorpay_signature) {
        await Orders.updateOne(
          { _id: orderId },
          {
            $set: {
              paymentStatus: "placed",  // Corrected field name
            },
          }
        );
  
        console.log("Payment is successful");
        res.json({ status: true });
      } else {
        await Orders.updateOne(
          { _id: orderId },
          {
            $set: {
              paymentStatus: "failed",  // Corrected field name
            },
          }
        );
  
        console.log("Payment is failed");
        res.json({ status: false, errMsg: "Payment verification failed" });
      }
    } catch (error) {
      console.log('Try catch error in verifyPayment  🤷‍♂️📀🤷‍♀️');
      console.log(error.message);
      res.status(500).json({ status: false, errMsg: "Internal Server Error" });
    }
};

module.exports.orderPlaced = async(req,res)=>{
    try {
        
        const userId = req.session.user._id;
        const cartDelete = await Cart.deleteOne({userId: userId});
        const orderId = req.params.id;
        const order = await Orders.findOne({ _id: orderId });

        if (order) {
            for (const element of order.items) {
                const decrementProductStock = await Product.findOneAndUpdate(
                    { _id: element.prodId },
                    { $inc: { stock: -element.quantity } },
                    { new: true }
                );
                // The { new: true } option returns the modified document instead of the original one
                console.log(decrementProductStock);
            }
        } else {
            console.log("Order not found");
        }
        

if (order) {

    const user = req.session.user;
    const category = await getCategory();
    if(cartDelete){
      // console.log("👌👌👌👌👌👌👌👌" + order)
        // console.log(cartDelete)
    res.render('user/order-placed', { category ,order , user: user})
    }else{
        console.log('order deletion failed and not placed')
    }
} else {
    console.log("Order not found");
}


    } catch (error) {
        console.log(error.message)
    }
}

module.exports.orderDetail = async(req,res)=>{
    try {
        const id = req.params.id;
        const order = await Orders.findOne({_id: id});
        const user = req.session.user;
        const category = await getCategory();
        res.render('user/order-detail', {order: order,  category , user: user})
    } catch (error) {
        console.log(error.message);
    }
}

module.exports.orders = async (req, res) => {
    try {
        
        const category = await Category.find()
        const id = req.session.user._id;
        const orders = await Orders.find({userId:id}).sort({_id: -1}) ;
        console.log (orders)
        
        res.render('user/orders-list', { orders: orders, category });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

module.exports.cancelOrder = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const orderId = req.params.id;

        const cancelOrder = await Orders.findOneAndUpdate(
            { _id: orderId, userId: userId },
            { $set: { canceled: true } },
            { new: true }
        );

        if (!cancelOrder) {
            console.log('Error in cancelling the order or unauthorized access');
            return res.status(400).send('Error in cancelling the order or unauthorized access');
        }

        // If the payment method is Razorpay, refund the amount to the wallet
        if (cancelOrder.paymentMethod === 'Razorpay') {
            let wallet = await Wallet.findOne({ userId: userId });
            let transaction = await Transaction.findOne({ userId: userId });

            if (!wallet) {
                wallet = new Wallet({
                    userId: userId,
                    walletBalance: 0,
                });
            }

            wallet.walletBalance = Number(wallet.walletBalance) + Number(cancelOrder.totalPrice);
            await wallet.save();

            if (!transaction) {
                transaction = new Transaction({
                    userId: userId,
                    transaction: [{ mode: 'Credit', amount: cancelOrder.totalPrice }],
                });
            } else {
                transaction.transaction.push({ mode: 'Credit', amount: cancelOrder.totalPrice });
            }

            await transaction.save();
        }

        console.log('Order cancelled successfully:', cancelOrder);
        res.redirect('/users/view-order-detail/' + orderId);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

module.exports.returnOrder = async (req,res) => {
  try{
    const id = req.params.id;
    const returnOrder = await Orders.findOneAndUpdate({_id:id},{
      $set:{
        returnRequest:true
      } })

      if(returnOrder){
       
        res.redirect('/users/view-order-detail/'+ id);
        }else{
            console.log('error in return the order')
        }
  }catch(error){
    console.log(error.message)
  }
}

module.exports.wallet = async(req,res)=>{
  try {
    const id = req.session.user._id;
    const wallet = await Wallet.findOne({userId: id});
    const transaction = await Transaction.findOne({userId: id});

    const category = await getCategory();

    res.render('user/wallet', {wallet: wallet, transaction: transaction,category:category})
  } catch (error) {
    console.log(error.message);
  }
}

module.exports.walletUsage = async (req, res) => {
  try {
    const userId = req.session.user._id;

    const userWallet = await Wallet.findOne({ userId: userId });
    const userCart = await Cart.findOne({ userId: userId });
    const TransactionDb = await Transaction.findOne({userId: userId})



    if (!userCart) {
      return res.status(400).send("No cart available.");
    }

    if (!userWallet) {
      return res.status(400).send("No wallet available.");
    }

    const total = parseFloat(req.body.data);
    const walletBalance = userWallet.walletBalance
    console.log(total + "🤦‍♀️");

    let orderTotal = 0;
    let wallet = 0;
    let totalSave = 0;

    if (total < walletBalance) {
      wallet =  walletBalance -  total;
      totalSave = total
      userWallet.walletBalance = wallet;
      await userWallet.save();
      const pushTrans = {
          mode: "Debit",
          amount: totalSave
        }

        TransactionDb.transaction.push(pushTrans)
    
      await TransactionDb.save();

    } else{
      totalSave = walletBalance
      orderTotal = total - walletBalance;
      wallet = 0;
      userWallet.walletBalance = wallet;
      await userWallet.save();
      const pushTrans = {
        mode: "Debit",
        amount: totalSave
      }

      TransactionDb.transaction.push(pushTrans)
  
    await TransactionDb.save();

    } 

    res.send({ totalBalance: orderTotal, walletBalance: wallet, saved: totalSave});
  } catch (error) {
    console.log('Try catch error in walletUsage  🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
};

//<------------------------------Admin-------------------------->

module.exports.orderList = async (req, res) => {
    try {
        
      const category = await Category.find()

      const orders = await Orders.find().sort({_id: -1}) ;
        
        
        res.render('admin/orderlist', { orders, category});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};

module.exports.orderDdetail = async(req,res) =>{
  try{
    const orderId = req.params.id;

    const order = await Orders.findById(orderId)
console.log(order)
    if(order){
      res.render('admin/orderdetail',{order})
    }

  }catch(error){
    console.log(error.message)
  }
}

module.exports.UpdateOrderStatus = async(req,res)=>{
  try {
    const status = req.body.orderStatus;
    const orderId = req.body.orderId;
    console.log(status + orderId + "👌👌👌👌👌👌👌👌👌👌👌👌😒😒😒😒");

    const changeOrderStatus = await Orders.findOneAndUpdate({_id: orderId},{
      $set: {
        orderStatus: status
      }
    },{
      new: true
    })
const order = await Orders.findOne({_id: orderId})

    if (order.orderStatus === 'Delivered') {
      order.deliveredAt = Date.now()
      await order.save();
    }

    await changeOrderStatus.save();
    

console.log(order + '😍😍😍😍😍😍😍😍😍😍😍😍😍😍😍');
    if(changeOrderStatus){
      res.redirect("/admin/order-detail/"+orderId)
    }else{
      console.log('order status updation failed');
    }


  } catch (error) {
    console.log(error.message)
  }
}

module.exports.allowReturn = async (req, res) => {
  try {
    const id = req.params.id;

    const order = await Orders.findOne({ _id: id });
    if (!order) {
      return res.status(404).send('Order not found');
    }

    order.returned = true;
    await order.save();

    console.log(order + "❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️");

    for (const item of order.items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.prodId },
        {
          $inc: {
            stock: item.quantity // Assuming item.quantity is the quantity of the product to be added back to stock
          }
        },
        { new: true } // To return the updated document
      );
      console.log(product);
    }

    const userId = order.userId;

    const wallet = await Wallet.findOne({userId: userId});
    const transactionDb = await Transaction.findOne({userId: userId})


    const trans = {
      mode: 'Credit',
      amount: order.totalPaid
    }
    transactionDb.transaction.push(trans);

   const pushTans =  await transactionDb.save();

   if(pushTans){
    console.log('transaction details pushed  👍👍👍👍👍👍🔥🔥🔥🔥🔥🔥🔥🔥');
   }else{
    console.log('error pushing transactioh details💕💕💕💕💕💕💕💕💕💕💕');
   }

    if(wallet){
      wallet.walletBalance += order.totalPaid
    }else{
      const NewWallet = new Wallet({
        userId: userId,
        walletBalance: order.totalPaid
      })
      const savedNewWallet = await NewWallet.save();


      const newTrans = new Transaction({
        userId: user,
        transaction: [{
          mode: 'Credit',
         amount: order.totalPaid,

       }]
      })

      const SaveNewTrans = await newTrans.save();

      if(SaveNewTrans){
        console.log('New transaction has been saved  📀📀📀📀📀📀💕💕💕👍👍👍👍👍');
      }else{
        console.log("Error saving new TRansaction ⛔⛔⛔⛔⛔⛔⛔⛔👋🤷‍♀️🤷‍♀️🤷‍♀️🤷‍♀️🤷‍♀️🤷‍♀️🤷‍♀️");
      }
    }







    res.redirect('/admin/order-detail/' + id);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};

