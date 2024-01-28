const { Category } = require("../models/CategorySchema");
const { Product } = require("../models/productShema");
const { User } = require("../models/userSchema");
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Varifying admin login

module.exports.adminLoginVerify = async (req,res) =>{
    try{
  const {email, password} = req.body;
  
  const userData = await User.findOne({email:email});
  if(userData){
    const passwordMatch = await bcrypt.compare(password,userData.password);
  
    if(passwordMatch){
      if(!userData.isAdmin){
        res.render('admin/adminlogin',{message: "Email or Password is incorrect"});
      }else{
        req.session.Admin = userData;
        req.session.login = true;
        res.redirect('/admin/dashboard')
        console.log(req.session)
      }
    }else{
      res.render('admin/adminlogin',{message: "Email or Password is incorrect"});
    }
  }else{
    res.render('admin/adminlogin',{message: "Email or Password is incorrect"});
  }
    }catch (error) {
      console.error('Error logging in', error);
      res.status(500).json({ error: 'An error occurred while logging in' });
  
    }
  }

module.exports.adminDashboard = (req,res) => {
  try {
    res.render('admin/dashboard');
} catch (error) {
    console.log(error.message)
}
}
  
// Listing All products in admin home page

  module.exports.adminHome = async (req, res) => {
  try {
    
    const products = await Product.find({ deleted: false });

    const populatedProducts = await Promise.all(
      products.map(async (product) => {
        
        const category = await Category.findById(product.category);
        return { ...product.toObject(), category: category };  // Combine product and category information
      })
    );

    
    console.log(populatedProducts);

    
    res.render('admin/adminhome', { product: populatedProducts });
  } catch (error) {
    console.log(error.message);
    
    res.status(500).send('Internal Server Error');
  }
};

// User block function

  module.exports.userManegement = async(req,res)=>{
    try {
        const user = await User.find({});

        res.render('admin/usermanagement', {user: user,messages: req.flash('info')});

    } catch (error) {
        
    }
}

module.exports.userBlock = async(req,res)=>{
  try {
      const id = req.params.id;

      if(req.query.confirmation === 'true'){
      const user = await User.findOneAndUpdate({_id: id},{
          $set: {blocked: true}
      })

      if(user){
          res.redirect("/admin/user-management")
      }else{
        console.log('can not block user');
        res.redirect("/admin/user-management")
      }
      }
  } catch (error) {
      console.log(error.message);
  }
}

//User unblock Function

module.exports.userUnBlock = async(req,res)=>{
  try {
      const id = req.params.id;
      const user = await User.findOneAndUpdate({_id: id},{
          $set: {blocked: false}
      })

      if(user){
        req.flash('info', 'User Unblocked Successfully!...')
          res.redirect("/admin/user-management")
      }
  } catch (error) {
      console.log(error.message);
  }
}

// Rendering Admin login page

module.exports.adminLoginPage = (req,res) =>{
  try{
      res.render('admin/adminlogin')
  }catch (error) {
      console.log(error.message)
    };
}

//Admin logout fuction

module.exports.adminLogout = (req, res) => {
  try {
      req.session.destroy((err) => {
          if (err) {
              console.log(err.message);
          } else {
              res.redirect('/admin');
          }
      });
  } catch (error) {
      console.log(error.message);
  }
};

//Admin dashboard function



  