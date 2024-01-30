const { Category } = require("../models/CategorySchema");
const { Address } = require("../models/addressSchema");
const { Cart } = require("../models/cartSchema");
const { Coupon } = require("../models/couponSchema");
const { Product } = require("../models/productShema");
const { Wallet } = require("../models/walletSchema");

// Finding Category

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

// Rendering cart page

module.exports.cart = async(req,res)=>{
  try {
      const id = req.session.user._id;
      const cart = await Cart.findOne({userId: id});
      const products = await Cart.findOne({userId: id}).populate('items.product');
      const user = req.session.user;
      const category = await getCategory();
      
          res.render("user/cart", {cart: cart, products: products, category, user: user});
     
          
     
  } catch (error) {
      console.log(error.message)
  }
}

// Adding products to the cart

module.exports.addToCartFromHome = async(req,res) => {
  try{
      let total = 0;
     const prodId =req.params.productId;
     const userid = req.session.user._id;
     const cart = await Cart.findOne({userId:userid});
     const product = await Product.findOne({userId:userid}).populate('items.product')
     console.log(cart);
     if(product){
      const subtotals = product.items.map((item) =>{
          return {
              productId:item.product._id,
              subtotal:item.product.price*item.quantity,
          }
      });

      const subtotalPrices = subtotals.map(item => item.subtotal);
     total = subtotalPrices.reduce((acc,cur) => acc + cur,0)
  }else{
      console.log('No items in the cart');
  }


   if(cart){
      const existingCartItems = cart.items.find(item => item.product.equals(prodId));


      if(existingCartItems){
          existingCartItems.quantity += 1;
      }else{
          cart.items.push({product: prodId, quantity: 1})
      }
      cart.totalPrice = total;
      await cart.save()

   }else{
      const newCart = new Cart({
          userId:userid,
          items:[{
              product:prodId,
              quantity:1
          }],
          totalPrice:total,
      })

      await newCart.save();
   }
res.redirect('/users/home/')
  }catch(error){
      console.log(error.message)
  }
} 

module.exports.productAddToCart = async(req,res) => {
  try{
      let total = 0;
     const prodId =req.params.productId;
     const userid = req.session.user._id;
     const cart = await Cart.findOne({userId:userid});
     const product = await Product.findOne({userId:userid}).populate('items.product')
     console.log(cart);
     if(product){
      const subtotals = product.items.map((item) =>{
          return {
              productId:item.product._id,
              subtotal:item.product.price*item.quantity,
          }
      });

      const subtotalPrices = subtotals.map(item => item.subtotal);
     total = subtotalPrices.reduce((acc,cur) => acc + cur,0)
  }else{
      console.log('No items in the cart');
  }


   if(cart){
      const existingCartItems = cart.items.find(item => item.product.equals(prodId));


      if(existingCartItems){
          existingCartItems.quantity += 1;
      }else{
          cart.items.push({product: prodId, quantity: 1})
      }
      cart.totalPrice = total;
      await cart.save()

   }else{
      const newCart = new Cart({
          userId:userid,
          items:[{
              product:prodId,
              quantity:1
          }],
          totalPrice:total,
      })

      await newCart.save();
   }
res.redirect('/users/product-single-view/'+ prodId)
  }catch(error){
      console.log(error.message)
  }
} 

//Product detail view

module.exports.singleProductView = async (req,res) => {
   try {

    const productid = req.params.productId;

    console.log(productid + "🙌");
    // const user = req.session.user;
        const category = await getCategory();
    const product = await Product.findOne({_id: productid})
    if(Product){
        res.render('user/productSingleView',{item: product, category})
    }else{
        console.log('Error while loading')
    }
    
   } catch (error) {
    console.log(error.message)
   }
}




// Fetch POST REQUEST TO UPDATE CART QUANTITY

module.exports.updateQuantity = async (req, res) => {
    try {
      const userId = req.session.user._id;
      const { productId, quantity, totalPrice } = req.body;
  
      // console.log(totalPrice + "");
      const cart = await Cart.findOneAndUpdate(
        { userId: userId, "items.product": productId },
        {
          $set: { "items.$.quantity": quantity, totalprice: totalPrice },
        },
        { new: true }
      );
  
      const prodId = await Product.findOne({ _id: productId });
      const stock = prodId.stock;
  
      await prodId.save();
  
      const user = req.session.user;
      const product = await Cart.findOne({ userId: user._id }).populate(
        "items.product"
      );
  
      const subtotals = product.items.map((item) => {
        return {
          productId: item.product._id,
          subtotal: item.product.price * item.quantity,
        };
      });
  
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Product not found in the cart",
        });
      }
  
      const quantityrsp = parseInt(quantity);
  
      res.json({
        success: true,
        message: "Cart updated successfully",
        subtotal: subtotals,
        stock: stock,
        quantity: quantityrsp,
        prodId: productId,
      });
    } catch (error) {
      console.log("Try catch error in updateQuantity 🤷‍♂️📀🤷‍♀️");
      console.log(error.message);
    }
  };
  
// cart page rendering

  module.exports.checkout = async(req,res)=>{
    try {
      const id = req.session.user._id;
      const products = await Cart.findOne({userId: id}).populate('items.product');
     
      const address = await Address.findOne({userId: id});
      const wallet = await Wallet.findOne({userId: id});
      
      const user = req.session.user;
      const category = await getCategory();
      res.render('user/checkout-page', {address: address, products: products, category, user: user, wallet: wallet});
    } catch (error) {
      console.log(error.message);
    }
  }

  
//Removing products from cart

  module.exports.removeCartProduct = async (req, res) => {
    try {
      const id = req.params.id;
      const userId = req.session.user._id;
  
      const cart = await Cart.findOne({ userId: userId }).populate('items.product');
  
      if (!cart) {
        return res.status(404).send({ error: 'Cart not found' });
      }
  
      const productIndex = cart.items.findIndex((item) => item.product._id.toString() === id);
  
      if (productIndex === -1) {
        return res.status(404).send({ error: 'Product not found in the cart' });
      }
  
      cart.items.splice(productIndex, 1);
  
      await cart.save();
      res.redirect('/users/cart');
    } catch (error) {
      console.error('Error removing product from cart:', error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  };
  